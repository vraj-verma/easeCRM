require('dotenv').config();
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from './security/jwt.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthService } from './services/auth.service';
import { EmailProcessor } from './queues/email.queue';
import { UserService } from './services/users.service';
import { Schemas } from './mongoSchemas/schemas.config';
import { ApiKeyService } from './services/apiKey.service';
import { MailService } from './mails/mail-template.service';
import { ProfileService } from './services/profile.service';
import { AuthController } from './controllers/auth.controller';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ApiKeyController } from './controllers/apiKey.controller';
import { ProfileController } from './controllers/profile.controller';
import { JwtStrategy, TokenStrategy } from './security/jwt.strategy';
import { FileSizeValidationPipe } from './pipes/fileSizeValidation.pipe';
import { Utility } from './utils/utility';
import { GoogleStrategy } from './security/google.strategy';

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
    MongooseModule.forRoot(process.env.MONGO_URI, { dbName: process.env.MONGO_DB }),
    MongooseModule.forFeature(Schemas),
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
    ProfileController,
    ApiKeyController,
  ],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    TokenStrategy,
    GoogleStrategy,
    ValidationPipe,
    MailService,
    EmailProcessor,
    FileSizeValidationPipe,
    ProfileService,
    ApiKeyService,
    Utility,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
