import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Mail } from '../types/mail.type';

@Processor('sendingMail')
export class EmailProcessor {
     constructor(
          private readonly mailService: MailerService
     ) { }

     @Process('welcome')
     async sendWelcomeEmail(job: Job<Mail>) {

          const { data } = job;

          await this.mailService.sendMail({ 
               ...data,
               to: data.email,
               subject: 'Welcome to EaseCRM App! Okay',
               template: '<h2>Ease CRM</h2>', // `.hbs` extension is appended automatically
               // context: { // ✏️ filling curly brackets with content
               //      name: user.name,
               //      url,
               // },
          });
     }

     // @Process('reset-password')
     // async sendResetPasswordEmail(job: Job<Mail>) {
     //      const { data } = job;

     //      await this.mailService.sendMail({
     //           ...data,
     //           subject: 'Reset password',
     //           template: 'reset-password',
     //           context: {
     //                user: data.user,
     //           },
     //      });
     // }
}