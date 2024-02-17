import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../services/users.service";
import { Strategy as customStrategy } from 'passport-custom';
import { ApiKeyService } from "../services/apiKey.service";
import { Role } from "src/types/authUser";

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

          if (!user.verified) {
               throw new HttpException(
                    `Unauthorized, Please verify your account first.`,
                    HttpStatus.BAD_REQUEST
               );
          }

          return { ...user };
     }
}

@Injectable()
export class TokenStrategy extends PassportStrategy(customStrategy, 'apikey') {
     constructor(
          private apiKeyService: ApiKeyService,
          private userService: UserService,
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

          const response = await this.apiKeyService.getApiKeyByApiKey(apiKey)

          if (!response) {
               throw new HttpException(
                    `Unauthorized`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          const user = await this.userService.getAccountByAccountId(response['account_id']);

          if (!user.verified) {
               throw new HttpException(
                    `Please verify your account first.`,
                    HttpStatus.BAD_REQUEST
               );
          }

          if (response['role'] == Role.viewer) {
               throw new HttpException(
                    `Unauthorized, your current role does not allow to access.`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          if (!response) {
               throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
          }

          return { ...response, ...user };
     }
}