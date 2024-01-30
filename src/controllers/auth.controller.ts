import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";
import { Signup } from "../types/signup";
import { UserService } from "../services/users.service";
import { User } from "../types/user";
import { AuthUser, Role, Status } from "../types/authUser";
import { Plan } from "../types/account";
import { ValidationPipe } from "../pipes/validation.pipe";
import { JoiValidationSchema } from "../validations/schema.validation";
import { MailService } from "src/mails/mail-template.service";

@Controller('/v1/api/auth/')
export class AuthController {
     constructor(
          private authService: AuthService,
          private userService: UserService,
          // private mailChimp: MailChimp,
          private mailService: MailService,
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
               )
          }

          const accountInitalData = {
               email: data.email,
               name: data.name,
               role: Role.owner,
               plan: Plan.free,
               users_used: 1,
               users_limit: 2,
          }

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
               user_id: user.user_id,
               email: data.email,
               role: Role.owner,
               status: Status.active,
               name: data.name,
               users_limit: 1,
               users_used: 2
          }

          if (!account_id || !user) {
               throw new HttpException(
                    `Account did not set up`,
                    HttpStatus.BAD_REQUEST
               )
          }

          this.mailService.sendWelcomeEmail(userData)
          
          res.status(201).json(authUser);
     }

}