import formData from 'form-data';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/dist/lib/client';
import { Config } from '../config';
import * as path from 'path';
import * as fs from 'fs';
import { formatTemplate } from '../utils/fn';

export type Message = {
  to: string[] | string;
  subject: string;
  body: string;
};

type SignupTemplate = {
  fullName: string
};

type SignupApproveTemplate = {
  fullName: string
  login: string
  password: string
};

type SignupRejectedTemplate = {
  fullName: string
};

export interface IMailClient {
  sendEmail: (data: Message) => Promise<any>;
  signupTemplate: (data: SignupTemplate) => string,
  signupApprovedTemplate: (data: SignupApproveTemplate) => string,
  signupRejectedTemplate: (data: SignupRejectedTemplate) => string,
}

class MailService implements IMailClient {
  mailgun: Client;

  domain: string;

  supportEmail: string;

  constructor(config: Config) {
    const mailgun = new Mailgun(formData);

    this.mailgun = mailgun.client({
      username: 'api',
      key: config.MAILGUN_API_KEY,
      url: `https://api.eu.mailgun.net/`
    });

    this.domain = config.MAILGUN_DOMAIN;
    this.supportEmail = config.SUPPORT_EMAIL;
  }

  signupTemplate = (bodyData : SignupTemplate): string => {
    const confirmBodyTemplate = path.join(__dirname, '../../assets/email-templates/signup-body.html');

    return formatTemplate(fs.readFileSync(confirmBodyTemplate, 'utf8'), bodyData);
  };

  signupApprovedTemplate = (bodyData : SignupApproveTemplate): string => {
    const confirmBodyTemplate = path.join(__dirname, '../../assets/email-templates/signup-approve-body.html');

    return formatTemplate(fs.readFileSync(confirmBodyTemplate, 'utf8'), bodyData);
  };

  signupRejectedTemplate = (bodyData : SignupRejectedTemplate): string => {
    const confirmBodyTemplate = path.join(__dirname, '../../assets/email-templates/signup-reject-body.html');

    return formatTemplate(fs.readFileSync(confirmBodyTemplate, 'utf8'), bodyData);
  };

  sendEmail = async (data: Message): Promise<any> => {
    const { to, subject, body } = data;

    const mailTemplate = path.join(__dirname, '../../assets/email-template.html');
    const html = formatTemplate(fs.readFileSync(mailTemplate, 'utf8'), {
      body,
    });

    const message = {
      from: this.supportEmail,
      to,
      subject: 'tokyo-Capital.com - ' + subject,
      html
    };

    try {
      return await this.mailgun.messages.create(this.domain, message);
    } catch (err: any) {
      console.log('Error send email', err);
    }
  };
}

export default MailService;
