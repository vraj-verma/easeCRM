import {
     Body,
     Controller,
     Get,
     HttpException,
     HttpStatus,
     Post,
     Query,
     Req,
     Res,
     UseGuards
} from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { User } from "../types/user";
import { Plan } from "../types/account";
import { JwtService } from "@nestjs/jwt";
import { Signin } from "../types/signin";
import { Signup } from "../types/signup";
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/users.service";
import { ValidationPipe } from "../pipes/validation.pipe";
import { AuthUser, Role, Status } from "../types/authUser";
import { MailService } from "../mails/mail-template.service";
import { JoiValidationSchema } from "../validations/schema.validation";
import { GoogleOAuthGuard } from "../security/google.guard";
import { ProfileService } from "../services/profile.service";

@Controller('auth')
export class AuthController {
     constructor(
          private authService: AuthService,
          private userService: UserService,
          private mailService: MailService,
          private jwtService: JwtService,
          private profileService: ProfileService
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
               password: data.password,
               verified: false,
          }

          const user = await this.userService.createUser(userData);

          const payload = {
               user_id: user._id,
               email: data.email
          }

          const token = this.jwtService.sign(payload, { expiresIn: '1h' })

          userData.token = token;

          const authUser: AuthUser = {
               account_id,
               _id: user.user_id,
               email: data.email,
               role: Role.owner,
               status: Status.active,
               name: data.name,
               users_limit: 1,
               users_used: 2,
               token
          }

          if (!account_id || !user) {
               throw new HttpException(
                    `Account not created, try again`,
                    HttpStatus.BAD_REQUEST
               );
          }

          this.mailService.sendWelcomeEmail(userData);

          res
               .status(201)
               .cookie('token', token)
               .json(authUser);
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


     @Get('verifyAccount')
     async verifyAccount(
          @Req() req: Request,
          @Res() res: Response,
          @Query('token') token: string
     ) {
          if (!token) {
               throw new HttpException(
                    `Token should not be empty!`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const decodedToken = await this.jwtService.verify(token);

          if (!decodedToken) {
               throw new HttpException(
                    `Token invalid or expired`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const authUser = await this.userService.getUserByEmail(decodedToken.email);

          if (!authUser) {
               throw new HttpException(
                    `User with email: ${decodedToken.email} does not exist`,
                    HttpStatus.NOT_FOUND
               );
          }

          if (authUser.verify) {
               throw new HttpException(
                    `Already verified.`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const verify = await this.userService.verfiyUser(decodedToken.email);

          if (!verify) {
               throw new HttpException(
                    `Something went wrong, Please try again`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(200).json(
               {
                    status: 'Success',
                    message: 'Verified',
               }
          );
     }

     @Get('google')
     @UseGuards(GoogleOAuthGuard)
     async googleAuth() { }

     @Get('google-redirect')
     @UseGuards(GoogleOAuthGuard)
     async googleAuthRedirect(
          @Req() req: Request,
          @Res() res: Response,
     ) {

          const user = req.user;

          const isUserExist = await this.userService.getUserByEmail(user['email']);

          if (isUserExist) {

               const payload = {
                    user_id: isUserExist._id,
                    email: user['email']
               }

               const token = this.jwtService.sign(payload);

               const cookieOption = {
                    httpOnly: true,
                    secure: true
               }

               res
                    .status(200)
                    .cookie('access-token', token, cookieOption)
                    .json(
                         {
                              ...isUserExist, token
                         }
                    );
          } else {

               const accountInitalData = {
                    email: user['email'],
                    name: user['name'],
                    role: Role.owner,
                    plan: Plan.free,
                    users_used: 1,
                    users_limit: 2,
               }

               const response = await this.authService.signup(accountInitalData);
               if (!response) {
                    throw new HttpException(
                         `Failed to create an account with Google`,
                         HttpStatus.NOT_IMPLEMENTED
                    );
               }

               const userData: User = {
                    account_id: response['_id'],
                    email: user['email'],
                    name: user['name'] ? user['name'] : 'John Doe',
                    role: Role.owner,
                    password: '',
                    verified: false,
               }

               const creatUser = await this.userService.createUser(userData)

               const payload = {
                    user_id: creatUser._id,
                    email: user['email']
               }

               const token = this.jwtService.sign(payload);

               await this.mailService.sendWelcomeEmail({ name: user['name'], email: user['email'], token });

               // save avatar only in google OAuth case
               const profileInfo = {
                    user_id: creatUser._id,
                    email: user['email'],
                    avatar: user['avatar']
               }

               await this.profileService.uploadAvatar(profileInfo);

               const authUser: AuthUser = {
                    account_id: response['account_id'],
                    _id: creatUser._id,
                    email: user['email'],
                    role: Role.owner,
                    status: Status.active,
                    name: user['name'],
                    users_limit: 1,
                    users_used: 2,
                    token
               }

               res
                    .status(201)
                    .cookie('token', token)
                    .json(authUser);
          }
     }

}