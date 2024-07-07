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

