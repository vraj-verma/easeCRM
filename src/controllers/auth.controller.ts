import {
     Body,
     Controller,
     Get,
     HttpException,
     HttpStatus,
     Post,
     Query,
     Req,
     Res
} from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { User } from "../types/user";
import { Plan } from "../types/account";
import { Signin } from "../types/signin";
import { Signup } from "../types/signup";
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/users.service";
import { ValidationPipe } from "../pipes/validation.pipe";
import { AuthUser, Role, Status } from "../types/authUser";
import { MailService } from "../mails/mail-template.service";
import { JoiValidationSchema } from "../validations/schema.validation";
import { JwtService } from "@nestjs/jwt";

@Controller('auth')
export class AuthController {
     constructor(
          private authService: AuthService,
          private userService: UserService,
          private mailService: MailService,
          private jwtService: JwtService,
     ) { }

     @Post('signup')
     async signup(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.signupSchema)) data: Signup,
     ) {
          const isAccountExist = await this.userService.getUserByEmail(data.email);

          if (isAccountExist) {
               throw new HttpException(
                    `User exist, please login`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const accountInitalData = {
               email: data.email,
               name: data.name,
               role: Role.owner,
               plan: Plan.free,
               users_used: 1,
               users_limit: 2,
          }

          const hash = await bcrypt.hash(data.password, 5);
          data.password = hash;

          const account_id = await this.authService.signup(accountInitalData);

          const userData: User = {
               account_id: account_id,
               email: data.email,
               name: data.name ? data.name : 'John Doe',
               role: Role.owner,
               password: data.password
          }

          const user = await this.userService.createUser(userData);

          const authUser: AuthUser = {
               account_id,
               _id: user.user_id,
               email: data.email,
               role: Role.owner,
               status: Status.active,
               name: data.name,
               users_limit: 1,
               users_used: 2
          }

          if (!account_id || !user) {
               throw new HttpException(
                    `Account not created, try again`,
                    HttpStatus.BAD_REQUEST
               );
          }

          this.mailService.sendWelcomeEmail(userData);

          res.status(201).json(authUser);
     }

     @Post('signin')
     async signin(
          @Req() req: Request,
          @Res() res: Response,
          @Body() signin: Signin
     ) {
          const user = await this.userService.getUserByEmail(signin.email);

          if (!user) {
               throw new HttpException(
                    `User is not registered, please signup first`,
                    HttpStatus.NOT_FOUND
               );
          }

          if (user?.account.status !== Status.active) {
               throw new HttpException(
                    `Account is not active, please contact to Admin`,
                    HttpStatus.NOT_FOUND
               );
          }

          const isPasswordMatch = await bcrypt.compare(signin.password, user.password);

          if (!isPasswordMatch) {
               throw new HttpException(
                    `Password does not match, please retry`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const payload = {
               user_id: user._id,
               email: user.email
          }

          const token = this.jwtService.sign(payload);

          const cookieOption = {
               httpOnly: true,
               secure: true
          }

          user.password = undefined;

          res
               .status(200)
               .cookie('access-token', token, cookieOption)
               .json(
                    {
                         ...user, token
                    }
               );
     }


}