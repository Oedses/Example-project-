import { CronTime } from "cron";
import { Status } from "../../shared/types/common";
import { EntityType, NotificationType } from "../../shared/types/notification";
import { DividendProduct, InterestProduct, isDividendProduct, isInterestProduct, PaymentFrequency, Product } from "../../shared/types/product";
import { PaymentType, TransactionStatus, TransactionType } from "../../shared/types/transaction";
import { CronJobClient } from "./clients/CronJobClient";
import { Config } from "./config";
import initDB from './db';
import Clients from "./modules/clients";
import Repositories from "./modules/repositories";
import { createSeparatorsNumber, getDutchHolidays } from "./utils/fn";

const areDatesEqual = (a: Date, b: Date) => {
  const dateA = new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
  const dateB = new Date(Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()));

  return dateA.getTime() === dateB.getTime();
};

const isWorkDay = (date: Date) => {
  const holidayDates = getDutchHolidays(date.getFullYear());
  if (date.getDay() === 0 || date.getDay() === 6 || holidayDates.includes(date)) return false;

  return true;
};

const lastWorkDayOfTheMonth = (numberOfMonth: number) => {
  const date = new Date;
  const today = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const nextMonth = new Date(Date.UTC(today.getFullYear(), numberOfMonth + 1));
  let lastDay = new Date(nextMonth.setDate(nextMonth.getDate() - 1));

  const holidayDates = getDutchHolidays(date.getFullYear());

  if (!isWorkDay(date)) {
    holidayDates.forEach(x => {
      if (areDatesEqual(x, lastDay)) lastDay = new Date(lastDay.setDate(lastDay.getDate() - 1));
    });

    if (lastDay.getDay() === 0) lastDay = new Date(lastDay.setDate(lastDay.getDate() - 2));
    if (lastDay.getDay() === 6) lastDay = new Date(lastDay.setDate(lastDay.getDate() - 1));
  }

  return lastDay;
};

const countOfPayments = (product: InterestProduct) => {
  if (product.paymentFrequency === PaymentFrequency.QUARTERLY) return 4;
  if (product.paymentFrequency === PaymentFrequency.BIANNUALLY) return 2;

  return 1;
};

const getMondaysOfMonth = (month: number) => {

  const date = new Date();
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) ;
  const mondays: Date[] = [];

  d.setDate(1);

  // Get the first Monday in the month
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() + 1);
  }

  // Get all the other Mondays in the month
  while (d.getMonth() === month) {
    mondays.push(new Date(d.getTime()));
    d.setDate(d.getDate() + 7);
  }

  return mondays;
};

function dateRangeDates(startDate: string | Date, endDate: string | Date, steps = 1) {
  const dateArray: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dateArray.push(new Date(currentDate));
    // Use UTC date to prevent problems with time zones and DST
    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  }

  return dateArray;
}

const createTextForMaturingProduct = (name: string, countOfDays: number) => {
  return `The product ${ name } will mature in ${countOfDays} day${countOfDays > 1 ? 's' : ''}.`;
};

const createCombinedMessageForInterest = (productsMessages: string[], numberOfReminder: 'first' | 'second' | 'last') => {
  const messages = productsMessages.filter(Boolean);
  return `Dear admin,<br>
  ${messages.join('<br>----------------------<br>')}<br>
  This is the ${ numberOfReminder } reminder.<br>
  Regards, TCX`;
};


const createCombinedMessageForMaturity = (productsMessages: string[], typeOfReceiver: 'admin' | 'issuer' | 'investor', countOfDays: number) => {

  return `Dear ${typeOfReceiver},<br>
  These products will be mature in ${countOfDays} day${countOfDays > 1 ? 's' : ''}:<br>
  ${productsMessages.join(', ')}<br>
  Regards, TCX`;
};

const createMessageForInterest = (product: InterestProduct, date: Date, repaymentsAmount: number) => {
  if (((product.quantity - product.availableVolume!) * product.ticketSize - repaymentsAmount) <= 0) return '';
  const interest = createSeparatorsNumber(((product.quantity - product.availableVolume!) * product.ticketSize - repaymentsAmount) * product.couponRate! / 100 / countOfPayments(product));


  return `The ${ product.name } is scheduled to pay out the ${ product.paymentFrequency } with coupon rate ${ product.couponRate } interest by ${ date.getUTCFullYear() }-${ date.getMonth() + 1 }-${ date.getDate() }.\n
  The calculated amount over this ${ product.paymentFrequency } interest is: &#8364; ${ interest }.\n`;
};

const createCombinedMessageForDividens = (products: DividendProduct[], numberOfReminder: 'first' | 'second' | 'last') => {
  const productsNames = products.map(x => x.name);

  return `Dear admin,<br>
  These products are scheduled to pay out the dividend:<br>
  ${productsNames.join(',<br>')}<br>
  You can pay out the dividend though the TCX platform by adding a new transaction.<br>
  This is the ${ numberOfReminder } reminder.<br>
  Regards, TCX`;
};

const worker = async (config: Config) => {
  const pool = await initDB(config);

  const { mailClient } = new Clients(config, pool);
  const { productRepository, notificationRepository, holdingRepository, userRepository, transactionRepository } = new Repositories(pool);
  const cronJobClient = new CronJobClient();
  const countOfDaysForMaturity = 1;


  const checkProductsForNotifications = async () => {

    const date = new Date();
    const today = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    const theLastWorkDayOfMarch = lastWorkDayOfTheMonth(2);
    const theLastWorkDayOfJune = lastWorkDayOfTheMonth(5);
    const theLastWorkDayOfSeptember = lastWorkDayOfTheMonth(8);
    const theLastWorkDayOfDecember = lastWorkDayOfTheMonth(11);

    const getDateForRemind = (type: 'first' | 'second') => {
      const dateInFuture = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      let dateForRemind = new Date(dateInFuture.setDate(dateInFuture.getDate() + (type === 'first' ? 9 : 2)));

      const holidayDates = getDutchHolidays(dateForRemind.getFullYear());

      const rangeDates = dateRangeDates(today, dateForRemind);

      rangeDates.forEach((x) => {
        if (x.getDay() === 0) dateForRemind = new Date(dateForRemind.setDate(dateForRemind.getDate() + 1));
        if (x.getDay() === 6) dateForRemind = new Date(dateForRemind.setDate(dateForRemind.getDate() + 1));
      });

      holidayDates.forEach(x => {
        rangeDates.forEach((y) => {
          if (areDatesEqual(y, x)) dateForRemind = new Date(dateForRemind.setDate(dateForRemind.getDate() + 1));
        });
        if (areDatesEqual(x, dateForRemind)) dateForRemind = new Date(dateForRemind.setDate(dateForRemind.getDate() + 1));
      });

      if (!isWorkDay(dateForRemind)) {
        holidayDates.forEach(x => {
          if (areDatesEqual(x, dateForRemind)) dateForRemind = new Date(dateForRemind.setDate(dateForRemind.getDate() + 1));
        });

        if (dateForRemind.getDay() === 0) dateForRemind = new Date(dateForRemind.setDate(dateForRemind.getDate() + 1));
        if (dateForRemind.getDay() === 6) dateForRemind = new Date(dateForRemind.setDate(dateForRemind.getDate() + 2));
      }

      return dateForRemind;
    };

    const firstRemindDay = getDateForRemind('first');
    const secondRemindDay = getDateForRemind('second');

    const getDateForNextPayment = (product: Product) => {
      const currentMonth = new Date().getMonth();

      if (product.paymentFrequency === PaymentFrequency.QUARTERLY) {

        if (currentMonth >= 0 && currentMonth < 3) return theLastWorkDayOfMarch;
        if (currentMonth >= 3 &&  currentMonth < 6) return theLastWorkDayOfJune;
        if (currentMonth >= 6 && currentMonth < 9) return theLastWorkDayOfSeptember;

        return theLastWorkDayOfDecember;
      }

      if (product.paymentFrequency === PaymentFrequency.BIANNUALLY) {
        if (currentMonth >= 0 &&  currentMonth < 6) return theLastWorkDayOfJune;

        return theLastWorkDayOfDecember;
      }

      return theLastWorkDayOfDecember;
    };

    const products = await productRepository.find({ status: Status.active });

    if (!products.length) return;

    const messageForNotifications = "This is a reminder to pay quarterly interest";
    const messageForDividendNotifications = "This is a reminder to pay dividend";

    const quarterlyFirstRemind: string[] = [];
    const quarterlySecondRemind: string[] = [];

    const biannuallyFirstRemind: string[] = [];
    const biannuallySecondRemind: string[] = [];

    const annuallyFirstRemind: string[] = [];
    const annuallySecondRemind: string[] = [];

    const admins = await userRepository.findAdmins();

    const adminsEmails = admins.map(y => y.email);

    const investorsForMaturity: { investor: string, products: InterestProduct[] }[] = [];

    const issuersForMaturity: { issuer: string, products: InterestProduct[] }[] = [];

    const productsForMaturity: InterestProduct[] = [];

    const dividendsFirstRemind: DividendProduct[] = [];
    const dividendsSecondRemind: DividendProduct[] = [];
    const dividendsThirdRemind: DividendProduct[] = [];

    for await (let x of products) {
      let maturityDate: Date | null = null;

      if (isInterestProduct(x)) {
        const maturityYear =
            x.maturityUnit === "years"
              ? x.listingDate!.getFullYear() + x.maturity!
              : x.listingDate!.getFullYear();
        const maturityMonths =
            x.maturityUnit === "months"
              ? x.listingDate!.getMonth() + x.maturity!
              : x.listingDate!.getMonth();

        maturityDate = new Date(Date.UTC(
          maturityYear,
          maturityMonths,
          x.listingDate!.getDate()
        ));

        const maturityNotificationDay = new Date(maturityDate.getFullYear(), maturityDate.getMonth(), maturityDate.getDate() - countOfDaysForMaturity);

        // check maturity of product
        if (today.getTime() >= maturityDate.getTime()) {
          productRepository.updateById(x.id, { status: Status.inactive });
          continue;
        }

        if (areDatesEqual(today, maturityNotificationDay)) {
          const issuer = await userRepository.findById(x.issuer as string);
          const holdings = await holdingRepository.find({ product: x.id! }, { availableVolume: { $gt: 0 } });
          const investorsIds = holdings.map(y => y.investor);
          const investors = await userRepository.find({}, { id: { $in: investorsIds } });
          const investorsEmails = investors.map(y => y.email);

          productsForMaturity.push(x);

          if (investorsEmails) {

            investorsEmails.forEach((y) => {
              const investorAdded = investorsForMaturity.find((z) => z.investor === y);
              if (investorAdded) {
                investorsForMaturity.forEach((z) => {
                  if (z.investor === y) z.products.push(x as InterestProduct);
                });
              } else investorsForMaturity.push({ investor: y, products: [x as InterestProduct] });
            });
          }

          const issuerAdded = issuersForMaturity.find((z) => z.issuer === issuer!.email);

          if (issuerAdded) {
            issuersForMaturity.forEach((z) => {
              if (z.issuer === issuer?.email) z.products.push(x as InterestProduct);
            });
          } else issuersForMaturity.push({ issuer: issuer!.email, products: [x as InterestProduct] });
        }
      }

      // If product haven't been sold
      if (x.quantity !== x.availableVolume) {

        const repaymentTransactions = await transactionRepository.find({ status: TransactionStatus.processed, product: x.id as any, type: TransactionType.PAYMENT, paymentType: PaymentType.REPAYMENT }, {});

        const repaidAmount = repaymentTransactions.reduce((acc, curr) => {
        // eslint-disable-next-line no-param-reassign
          return acc += Number(curr.amount);
        }, 0);

        const dateForNextPayment = getDateForNextPayment(x);

        if (maturityDate && (dateForNextPayment.getTime() >= maturityDate.getTime())) {
          continue;
        }

        if (x.paymentFrequency === PaymentFrequency.QUARTERLY) {

          if (areDatesEqual(firstRemindDay, theLastWorkDayOfMarch)
          || areDatesEqual(firstRemindDay, theLastWorkDayOfJune)
          || areDatesEqual(firstRemindDay, theLastWorkDayOfSeptember)
          || areDatesEqual(firstRemindDay, theLastWorkDayOfDecember)) {

            const message = createMessageForInterest(x as InterestProduct, dateForNextPayment, repaidAmount);

            quarterlyFirstRemind.push(message);
          }

          if (areDatesEqual(secondRemindDay, theLastWorkDayOfMarch)
          || areDatesEqual(secondRemindDay, theLastWorkDayOfJune)
          || areDatesEqual(secondRemindDay, theLastWorkDayOfSeptember)
          || areDatesEqual(secondRemindDay, theLastWorkDayOfDecember)) {

            const message = createMessageForInterest(x as InterestProduct, dateForNextPayment, repaidAmount);

            quarterlySecondRemind.push(message);
          }
        }

        if (x.paymentFrequency === PaymentFrequency.BIANNUALLY) {
          if (areDatesEqual(firstRemindDay, theLastWorkDayOfJune) || areDatesEqual(firstRemindDay, theLastWorkDayOfDecember)) {

            const message = createMessageForInterest(x as InterestProduct, dateForNextPayment, repaidAmount);

            biannuallyFirstRemind.push(message);

          }
          if (areDatesEqual(secondRemindDay, theLastWorkDayOfJune) || areDatesEqual(secondRemindDay, theLastWorkDayOfDecember)) {
            const message = createMessageForInterest(x as InterestProduct, dateForNextPayment, repaidAmount);

            biannuallySecondRemind.push(message);
          }
        }

        if (x.paymentFrequency === PaymentFrequency.ANNUALLY) {
          if (areDatesEqual(firstRemindDay, theLastWorkDayOfDecember)) {
            const message = createMessageForInterest(x as InterestProduct, dateForNextPayment, repaidAmount);

            annuallyFirstRemind.push(message);
          }
          if (areDatesEqual(secondRemindDay, theLastWorkDayOfDecember)) {
            const message = createMessageForInterest(x as InterestProduct, dateForNextPayment, repaidAmount);

            annuallySecondRemind.push(message);
          }
        }
      }

      if (isDividendProduct(x)) {
        const firstJanuaryMOnday = getMondaysOfMonth(0)[0];
        const mondaysOfMarch = getMondaysOfMonth(2);

        if (x.quantity === x.availableVolume) continue;

        if (areDatesEqual(today, firstJanuaryMOnday)) {
          dividendsFirstRemind.push(x);
        }

        if (areDatesEqual(today, mondaysOfMarch[2])) {
          dividendsSecondRemind.push(x);
        }

        if (areDatesEqual(today, mondaysOfMarch[3])) {
          dividendsThirdRemind.push(x);
        }
      }
    }

    if (investorsForMaturity.length) {
      const messages = investorsForMaturity.map((y) => {
        const investorsProducts = y.products.map((z) => z.name);
        return { to: y.investor, subject: 'Maturing of products', body: createCombinedMessageForMaturity(investorsProducts, 'investor', countOfDaysForMaturity) };
      });

      for (const x of investorsForMaturity) {

        for (const product of x.products) {
          const holdings = await holdingRepository.find({ product: product.id! }, { availableVolume: { $gt: 0 } });
          const investorsIds = holdings.map(y => y.investor);

          investorsIds.forEach(z => {
            notificationRepository.create({
              receiverId: z as string,
              entityType: EntityType.PRODUCT,
              relatedEntityId: product.id!,
              text: createTextForMaturingProduct(product.name, countOfDaysForMaturity),
              type: NotificationType.remindForMature,
              translationData: {
                productName: product.name,
                countOfDaysForMaturity
              }
            });
          });
        }
      }

      messages.forEach(x => mailClient.sendEmail(x));
    }

    if (issuersForMaturity.length) {
      const messages = issuersForMaturity.map((y) => {
        const issuerProducts = y.products.map((z) => z.name);
        return { to: y.issuer, subject: 'Maturing of products', body: createCombinedMessageForMaturity(issuerProducts, 'issuer', countOfDaysForMaturity) };
      });

      productsForMaturity.forEach((x) => {
        notificationRepository.create({
          receiverId: x.issuer as string,
          entityType: EntityType.PRODUCT,
          relatedEntityId: x.id!,
          text: createTextForMaturingProduct(x.name, countOfDaysForMaturity),
          type: NotificationType.remindForMature,
          translationData: {
            productName: x.name,
            countOfDaysForMaturity
          }
        });
      });

      messages.forEach(x => mailClient.sendEmail(x));
    }

    if (productsForMaturity.length) {
      const productsNames = productsForMaturity.map(x => x.name);
      const message = createCombinedMessageForMaturity(productsNames, 'admin', countOfDaysForMaturity);

      productsForMaturity.forEach((x) => {
        notificationRepository.create({
          entityType: EntityType.PRODUCT,
          relatedEntityId: x.id!,
          text: createTextForMaturingProduct(x.name, countOfDaysForMaturity),
          type: NotificationType.remindForMature,
          translationData: {
            productName: x.name,
            countOfDaysForMaturity
          }
        });
      });

      mailClient.sendEmail({ to: adminsEmails, subject: 'Maturing of products', body: message });
    }

    if (quarterlyFirstRemind.length) {
      const messages = createCombinedMessageForInterest(quarterlyFirstRemind, 'first');

      mailClient.sendEmail({ to: adminsEmails, subject: 'Quarterly payments reminder', body: messages });
    }

    if (quarterlySecondRemind.length) {
      const messages = createCombinedMessageForInterest(quarterlySecondRemind, 'second');

      mailClient.sendEmail({ to: adminsEmails, subject: 'Quarterly payments reminder', body: messages });
    }

    if (biannuallyFirstRemind.length) {
      const messages = createCombinedMessageForInterest(biannuallyFirstRemind, 'first');

      mailClient.sendEmail({ to: adminsEmails, subject: 'Bianually payments reminder', body: messages });
    }

    if (biannuallySecondRemind.length) {
      const messages = createCombinedMessageForInterest(biannuallySecondRemind, 'second');

      mailClient.sendEmail({ to: adminsEmails, subject: 'Bianually payments reminder', body: messages });
    }

    if (annuallyFirstRemind.length) {
      const messages = createCombinedMessageForInterest(annuallyFirstRemind, 'first');

      mailClient.sendEmail({ to: adminsEmails, subject: 'Anually payments reminder', body: messages });
    }

    if (annuallySecondRemind.length) {
      const messages = createCombinedMessageForInterest(annuallySecondRemind, 'second');

      mailClient.sendEmail({ to: adminsEmails, subject: 'Anually payments reminder', body: messages });
    }

    if (quarterlyFirstRemind.length || quarterlySecondRemind.length
      || biannuallyFirstRemind.length || biannuallySecondRemind.length
      || annuallyFirstRemind.length || annuallySecondRemind.length) {
      notificationRepository.create({
        entityType: EntityType.PRODUCT,
        relatedEntityId: products[0].id!,
        text: messageForNotifications,
        type: NotificationType.remindForPayment,
        translationData: {}
      });
    }


    if (dividendsFirstRemind.length) {
      const messages = createCombinedMessageForDividens(dividendsFirstRemind, 'first');

      notificationRepository.create({
        entityType: EntityType.PRODUCT,
        relatedEntityId: dividendsFirstRemind[0].id!,
        text: messageForDividendNotifications,
        type: NotificationType.remindForPayment,
        translationData: {}
      });

      mailClient.sendEmail({ to: adminsEmails, subject: 'Dividend payments reminder', body: messages });
    }

    if (dividendsSecondRemind.length) {
      const messages = createCombinedMessageForDividens(dividendsSecondRemind, 'second');

      notificationRepository.create({
        entityType: EntityType.PRODUCT,
        relatedEntityId: dividendsSecondRemind[0].id!,
        text: messageForDividendNotifications,
        type: NotificationType.remindForPayment,
        translationData: {}
      });

      mailClient.sendEmail({ to: adminsEmails, subject: 'Dividend payments reminder', body: messages });
    }

    if (dividendsThirdRemind.length) {
      const messages = createCombinedMessageForDividens(dividendsThirdRemind, 'last');

      notificationRepository.create({
        entityType: EntityType.PRODUCT,
        relatedEntityId: dividendsThirdRemind[0].id!,
        text: messageForDividendNotifications,
        type: NotificationType.remindForPayment,
        translationData: {}
      });

      mailClient.sendEmail({ to: adminsEmails, subject: 'Dividend payments reminder', body: messages });
    }
    console.log('Messages are sent');
  };

  cronJobClient.job('00 00 06 * * *' as unknown as CronTime, checkProductsForNotifications).start();
  console.log('Worker started');
};

export default worker;
