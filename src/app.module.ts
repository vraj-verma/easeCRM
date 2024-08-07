require('dotenv').config();
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { Utility } from './utils/utility';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './security/jwt.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './security/jwt.strategy';
import { EmailProcessor } from './queues/email.queue';
import { UserService } from './services/users.service';
import { Schemas } from './mongoSchemas/schemas.config';
import { ApiKeyService } from './services/apiKey.service';
import { APIKeyStrategy } from './security/apiKey.strategy';
import { MailService } from './mails/mail-template.service';
import { GoogleStrategy } from './security/google.strategy';
import { ProfileService } from './services/profile.service';
import { AccountService } from './services/account.service';
import { ContactService } from './services/contact.service';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { CronJobController } from './controllers/cron.controller';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ApiKeyController } from './controllers/apiKey.controller';
import { ProfileController } from './controllers/profile.controller';
import { ContactController } from './controllers/contact.controller';
import { AccountController } from './controllers/account.controller';
import { AdminController } from './controllers/admin/admin.controller';
import { FileSizeValidationPipe } from './pipes/fileSizeValidation.pipe';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env'
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' }
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, { dbName: process.env.MONGO_DB }),
    MongooseModule.forFeature(Schemas),
    MailerModule.forRoot(
      {
        transport: {
          host: process.env.GMAIL_HOST,
          port: +process.env.GMAIL_PORT,
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
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
      },
    }),
    BullModule.registerQueue({
      name: 'mail-queue'
    }),
    ThrottlerModule.forRoot([{
      ttl: +process.env.THROTTLE_TTL,
      limit: +process.env.THROTTLE_LIMIT,
    }]),
  ],
  controllers: [
    AuthController,
    ProfileController,
    ApiKeyController,
    AccountController,
    UserController,
    ContactController,
    AdminController,
    CronJobController,
  ],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    APIKeyStrategy,
    GoogleStrategy,
    ValidationPipe,
    MailService,
    EmailProcessor,
    FileSizeValidationPipe,
    ProfileService,
    ContactService,
    ApiKeyService,
    AccountService,
    Utility,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
