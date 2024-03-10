import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Mail } from '../types/mail.type';
import fs, { readFileSync } from 'fs';
import { join } from 'path';

// welcome email template
const welcomeTemplatePath = join('src/templates/welcome.template.html')
const welcomeEmailTemplate = readFileSync(welcomeTemplatePath, 'utf-8');

// invitation email template
const inviteTemplatePath = join('src/templates/invite-user.template.html')
const inviteEmailTemplate = readFileSync(inviteTemplatePath, 'utf-8');

@Processor('sendingMail')
export class EmailProcessor {
     constructor(
          private readonly mailService: MailerService
     ) { }

     @Process('welcome')
     async sendWelcomeEmail(job: Job<Mail>) {

          try {
               const { data } = job;

               const html = welcomeEmailTemplate.replace('[Customer Name]', data.name).replace('token', data.token);

               await this.mailService.sendMail(
                    {
                         // ...data,
                         to: data.email,
                         from: `Sumit from easeCRM <${process.env.GMAIL_USER}>`,
                         subject: 'Welcome to easeCRM! 🚀',
                         html: html,
                    }
               );
          } catch (error) {
               console.log('Welcome email not sent, please start redis on docker', error);
          }
     }

     @Process('invite')
     async sendInviteEmail(job: Job<Mail>) {

          try {
               const { data } = job;

               const html = inviteEmailTemplate.replace('[Name]', data.invited_username).replace('[Existing User]', data.name).replace('token', data.token);

               await this.mailService.sendMail(
                    {
                         // ...data,
                         to: data.email,
                         from: `Sumit from easeCRM <${process.env.GMAIL_USER}>`,
                         subject: 'Invitation to join easeCRM! 🚀',
                         html: html,
                    }
               );
          } catch (error) {
               console.log('Invite email not sent, please start redis on docker', error);
          }
     }

}