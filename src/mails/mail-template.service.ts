import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';


@Injectable()
export class MailService {
     constructor(
          @InjectQueue('sendingMail') private emailQueue: Queue,
     ) { }

     async sendWelcomeEmail(user: any) {
          // adding email task into Queue to sending email after 5 sec of delay after signup
          const job = await this.emailQueue.add('welcome', user, { delay: 5000 });
          return { jobId: job.id };
     }

     async sendInviteEmail(user: any) {
          const job = await this.emailQueue.add('invite', user, { delay: 5000 });
          return { jobId: job.id };
     }
}
