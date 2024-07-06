import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../services/users.service";
import { Strategy as customStrategy } from 'passport-custom';
import { ApiKeyService } from "../services/apiKey.service";
import { AccountService } from "../services/account.service";
import { Role } from "../enums/enums";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
     constructor(
          private readonly userService: UserService,
     ) {
          super(
               {
                    jwtFromRequest: ExtractJwt.fromExtractors([
                         ExtractJwt.fromAuthHeaderAsBearerToken(),
                         ExtractJwt.fromUrlQueryParameter('token'),
                    ]),
                    ignoreExpiration: false,
                    secretOrKey: process.env.JWT_SECRET,
                    passReqToCallback: true,
               }
          );
     }

     async validate(req: Request, payload: any) {

          const email = payload.email;
          const user = await this.userService.getUserByEmail(email);

          if (!user) {
               throw new HttpException(
                    `Unauthorized`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          if (user.account.status !== 'Active') {
               throw new HttpException(
                    `Unauthorized, Your account is not Active`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          if (!user.verified) {
               throw new HttpException(
                    `Unauthorized, Please verify your account first.`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          return { ...user };
     }
}

@Injectable()
export class APIKeyPassword extends PassportStrategy(customStrategy, 'apikey') {
     constructor(
          private apiKeyService: ApiKeyService,
          private accountService: AccountService,
     ) {
          super();
     }

     async validate(req: Request) {
          const apiKey = req?.headers['apikey'];

          if (!apiKey) {
               throw new HttpException(
                    `Unauthorized`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          const apiKeyResponse = await this.apiKeyService.getApiKeyByKey(apiKey)

          if (!apiKeyResponse) {
               throw new HttpException(
                    `Unauthorized`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          if (!apiKeyResponse.is_enabled) {
               throw new HttpException(
                    `Unauthorized, API key: ${apiKey} is not active`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          const user = await this.accountService.getAccountById(apiKeyResponse['account_id']);

          if (!user || !user.result.verified) {
               throw new HttpException(
                    `Unauthorized, Please verify your account first.`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          if (user.status !== 'Active') {
               throw new HttpException(
                    `Unauthorized, Your account is not Active`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          if (apiKeyResponse['role'] == Role.VIEWER) {
               throw new HttpException(
                    `Unauthorized, your current role : ${Role.VIEWER} does not allow to access.`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          if (!apiKeyResponse) {
               throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
          }

          return { ...apiKeyResponse, ...user.result };
     }
}