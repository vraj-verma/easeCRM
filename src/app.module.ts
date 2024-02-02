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
import { Logs, LogsSchema } from './schemas/logs.schema';
import { JwtModule } from '@nestjs/jwt';
import { Schemas } from './mongoSchemas/schemas.config';
import { FileSizeValidationPipe } from './pipes/fileSizeValidation.pipe';
import { ProfileService } from './services/profile.service';
import { ProfileController } from './controllers/profile.controller';
import { JwtStrategy, TokenStrategy } from './security/jwt.strategy';
import { JwtAuthGuard } from './security/jwt.guard';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env'
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' }
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
  ],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    TokenStrategy,
    ValidationPipe,
    MailService,
    EmailProcessor,
    FileSizeValidationPipe,
    ProfileService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
