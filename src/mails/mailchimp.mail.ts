
// import { Injectable } from '@nestjs/common';
// import { mailchimpClient } from '@mailchimp/mailchimp_transactional';

// @Injectable()
// export class MailChimpService {
//      private mailchimpClient: mailchimpClient;

//      constructor(apiKey: string) {
//           this.mailchimpClient = new mailchimpClient(apiKey);
//      }

//      async sendMail(message: any) {
//           const response = await this.mailchimpClient.messages.send(message);
//           console.log(response);
//           return response;
//      }
// }
