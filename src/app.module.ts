import { Schema } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './schemas/users.schema';
import { Account, AccountSchema } from './schemas/account.schema';


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
    )
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    AuthService,
  ],
})
export class AppModule { }
