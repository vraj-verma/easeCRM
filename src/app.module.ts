require('dotenv').config();
import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './schemas/users.schema';
import { Account, AccountSchema } from './schemas/account.schema';
import { UserService } from './services/users.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mails/mail-template.service';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './queues/email.queue';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env'
    }),
    MongooseModule.forRoot(process.env.MONGO_URI, { dbName: process.env.MONGO_DB }),
    MongooseModule.forFeature(
      [
        {
          name: Account.name, schema: AccountSchema
        },
        {
          name: User.name, schema: UserSchema
        }

      ]
    ),
    MailerModule.forRoot(
      {
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          }
        }
      }
    ),
    BullModule.forRoot({
      redis: {
        host: '"172.17.0.2',
        port: 6379
      },
    }),
    BullModule.registerQueue({
      name: 'sendingMail'
    }),
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
    UserService,
    ValidationPipe,
    MailService,
    EmailProcessor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
