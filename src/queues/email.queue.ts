import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Mail } from '../types/mail.type';
import fs, { readFileSync } from 'fs';
import { join } from 'path';

const templatePath = join('src/templates/welcome.template.html')
const emailTemplate = readFileSync(templatePath, 'utf-8');

@Processor('sendingMail')
export class EmailProcessor {
     constructor(
          private readonly mailService: MailerService
     ) { }

     @Process('welcome')
     async sendWelcomeEmail(job: Job<Mail>) {

          const { data } = job;

          const html = emailTemplate.replace('[Customer Name]', data.name);

          await this.mailService.sendMail({
               ...data,
               to: data.email,
               from: `Sumit from easeCRM <${process.env.GMAIL_USER}>`,
               subject: 'Welcome to easeCRM! 🚀',
               html: html
          });
     }

}