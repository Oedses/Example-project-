/* eslint-disable @typescript-eslint/lines-between-class-members */
import { SortingDirection } from '../Table/Table.utils';
import { DeltaDate } from './../../../../../../shared/types/date';

export class DateUtils {
  static defaultDelta: DeltaDate = {
    years: 0,
    months: 0,
    days: 0
  };

  static maxMaturityYears = 5;
  static maxMaturityMonths = this.maxMaturityYears * 12;

  static maxNonCallPeriodYears = 10;
  static maxNonCallPeriodMonths = this.maxNonCallPeriodYears * 12;

  static delta: DeltaDate = {
    ...this.defaultDelta,
    years: 5
  };

  static get _secondsInDay(): number {
    return 24 * 60 * 60 * 1000;
  }

  static get _secondsInMonth(): number {
    return 31 * this._secondsInDay;
  }

  static get _secondsInYear(): number {
    return 12 * this._secondsInMonth;
  }

  static addDeltaToDate(date: Date, delta: DeltaDate, increment: boolean): Date {
    const numberSign = increment ? 1 : -1;
    const yearsToAdd = date.getFullYear() + (delta.years * numberSign);
    const monthsToAdd = date.getMonth() + (delta.months * numberSign);
    const daysToAdd = date.getDate() + (delta.days * numberSign);

    const resultDate = new Date(yearsToAdd, monthsToAdd, daysToAdd, date.getHours());

    return resultDate;
  }

  static get maxDate(): Date {
    // return this.addDeltaToDate(new Date(), this.delta, true);
    return new Date('12/31/9999');
  }

  static get minDate(): Date {
    return new Date('01/01/1900');
  }

  static stringToDate(dateString: string): Date {
    const [day, month, year] = dateString?.toString()?.split('-').map(item => Number(item));
    return new Date(year, (month - 1), day);
  }

  static sortDate = (dateCurr: Date | string, dateNext: Date | string, direction: SortingDirection) => {
    if (!dateCurr || !dateNext) return 0;

    const [curr, next] = direction === SortingDirection.descending ? [dateCurr, dateNext] : [dateNext, dateCurr];

    return new Date(curr).getDate() - new Date(next).getDate();
  };

  static getDiff = (dateFrom: Date, dateTo: Date): number => dateFrom.getFullYear() - dateTo.getFullYear() + 1;
}
