import {
     Body,
     Controller,
     Get,
     HttpStatus,
     Post,
     Query,
     Req,
     Res,
     UseGuards
} from "@nestjs/common";
import {
     ApiExcludeEndpoint,
     ApiOperation,
     ApiResponse,
     ApiTags
} from "@nestjs/swagger";
import * as qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { JwtService } from "@nestjs/jwt";
import { Signin } from "../types/signin";
import { Signup } from "../types/signup";
import { Utility } from "../utils/utility";
import { Request, Response } from "express";
import { AuthUser } from './../types/authUser';
import { User } from "../schemas/users.schema";
import { User as UserType } from '../types/user'
import { ThrottlerGuard } from "@nestjs/throttler";
import { Plan, Role, Status } from "../enums/enums";
import { JwtAuthGuard } from "../security/jwt.guard";
import { Exception } from "../errors/exception.error";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/users.service";
import { ValidationPipe } from "../pipes/validation.pipe";
import { GoogleOAuthGuard } from "../security/google.guard";
import { ProfileService } from "../services/profile.service";
import { MailService } from "../mails/mail-template.service";
import { JoiValidationSchema } from "../validations/schema.validation";

@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {

     constructor(
          private utility: Utility,
          private jwtService: JwtService,
          private userService: UserService,
          private authService: AuthService,
          private mailService: MailService,
          private profileService: ProfileService,
     ) { }

     @ApiOperation({ summary: 'Create an account' })
     @ApiResponse({ type: AuthUser })
     @Post('signup')
     async signup(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.signupSchema)) data: Signup,
     ): Promise<AuthUser | any> {
          const isAccountExist = await this.userService.getUserByEmailId(data.email);

          if (isAccountExist) {
               throw new Exception(
                    `User exist, please login`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const accountInitalData = {
               email: data.email,
               name: data.name,
               role: Role.OWNER,
               plan: Plan.FREE,
               users_used: 1,
               users_limit: 2,
          }

          const hash = await this.utility.encryptPassword(data.password);
          data.password = hash;

          const account_id = await this.authService.signup(accountInitalData);

          const userData: UserType = {
               account_id: account_id,
               email: data.email,
               name: data.name ? data.name : 'John Doe',
               role: Role.OWNER,
               password: data.password,
               verified: false,
          }

          const user = await this.userService.createUser(userData);

          const payload = {
               _id: user._id,
               email: data.email
          }

          const token = this.jwtService.sign(payload, { expiresIn: '1h' })

          const authUser: AuthUser = {
               account_id,
               _id: user._id,
               email: data.email,
               role: Role.OWNER,
               status: Status.ACTIVE,
               name: data.name,
               users_limit: 1,
               users_used: 2,
               token
          }

          if (!account_id || !user) {
               throw new Exception(
                    `Account not created, try again`,
                    HttpStatus.BAD_REQUEST
               );
          }

          // const testEmails = this.utility.testingEmails;

          // if (!testEmails.includes(data.email)) {
          //      this.mailService.sendWelcomeEmail(userData);
          // }

          this.mailService.sendWelcomeEmail(userData);

          res
               .status(201)
               .cookie('token', token)
               .json(authUser);
     }

     @ApiOperation({ summary: 'Signin to account & get JWT token' })
     @ApiResponse({ type: User })
     @UseGuards(ThrottlerGuard)
     @Post('signin')
     async signin(
          @Req() req: Request,
          @Res() res: Response,
          @Body() signinPayload: Signin
     ) {

          const user = await this.userService.getUserByEmail(signinPayload.email);

          if (!user) {
               throw new Exception(
                    `User is not registered or the account is deleted, please signup first`,
                    HttpStatus.NOT_FOUND
               );
          }

          if (user.oAuth) {
               throw new Exception(
                    `Created with Google, please try log in with your Google account.`,
                    HttpStatus.BAD_REQUEST
               );
          }

          if (user?.account.status !== Status.ACTIVE) {
               throw new Exception(
                    `Account is not active, please contact to Admin`,
                    HttpStatus.NOT_FOUND
               );
          }

          if (!user.password) {
               throw new Exception(
                    `Please set your password, then login`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const isPasswordMatch = await this.utility.decryptPassword(signinPayload.password, user.password);

          if (!isPasswordMatch) {
               throw new Exception(
                    `Password does not match, please retry`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const payload = {
               _id: user._id,
               email: user.email,
               role: user.role,
               is2FAEnabled: user.is2FAEnabled
          }

          const token = this.utility.generateJWTToken(payload);

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

     @ApiOperation({ summary: 'Enable two factor authentication' })
     @ApiResponse({ type: String })
     @UseGuards(JwtAuthGuard)
     @Get('setup/2FA')
     async setup2FA(
          @Req() req: Request,
          @Res() res: Response
     ) {

          const user = <AuthUser>req.user;

          const secret = authenticator.generateSecret();

          const otpUrl = authenticator.keyuri(user.email, 'EASE CRM', secret);

          await this.userService.setTwoFactorAuthenticationSecret(secret, user.email);

          const qr = await qrcode.toDataURL(otpUrl);

          res.status(200).json(
               {
                    message: `2FA successfully setup, please note down the secret, it will help you to connect with your authenticator app`,
                    secret,
                    qr
               }
          );

     }

     @ApiOperation({ summary: 'Verify two factor authentication' })
     @ApiResponse({ type: String })
     @UseGuards(JwtAuthGuard)
     @Get('verify/2FA')
     async verify2FA(
          @Req() req: Request,
          @Res() res: Response,
          @Body('code') code: string
     ) {

          if (!code) {
               throw new Exception(
                    `Provide TOTP code`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const { email } = <AuthUser>req.user;

          const user = await this.userService.getUserByEmail(email);

          if (!user.is2FAEnabled) {
               throw new Exception(
                    `Please setup 2FA first`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const is2FAValid = authenticator.check(code, user.twoFASecrets);

          if (!is2FAValid) {
               throw new Exception(
                    `Invalid TOTP code`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(200).json(
               {
                    success: true,
                    message: `Valid TOTP code`
               }
          );

     }


     @ApiOperation({ summary: 'Verify account & access account' })
     @ApiResponse({ type: 'string' })
     @Get('verify-account')
     async verifyAccount(
          @Res() res: Response,
          @Query('token') token: string
     ) {

          if (!token) {
               throw new Exception(
                    `Token should not be empty!`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const decodedToken = await this.utility.verifyJWTToken(token);

          if (!decodedToken) {
               throw new Exception(
                    `Token invalid or expired`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const authUser = await this.userService.getUserByEmail(decodedToken.email);

          if (!authUser) {
               throw new Exception(
                    `User with email: ${decodedToken.email} does not exist`,
                    HttpStatus.NOT_FOUND
               );
          }

          if (authUser.verified) {
               throw new Exception(
                    `Already verified.`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const accountVerified = await this.userService.verfiyUser(decodedToken.email);

          if (!accountVerified) {
               throw new Exception(
                    `Something went wrong, Please try again`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(200).json(
               {
                    status: 'Success',
                    message: 'User verified',
               }
          );
     }

     @ApiOperation({ summary: 'Forgot password' })
     @ApiResponse({ type: 'string' })
     @Post('forgot-password')
     async forgotPassword(
          @Res() res: Response,
          @Body('email') email: string
     ) {

          const user = await this.userService.getUserByEmail(email);
          if (!user) {
               throw new Exception(
                    `User with email: ${email} not found`,
                    HttpStatus.NOT_FOUND
               );
          }

          const payload = {
               _id: user._id,
               email: user.email
          }

          const token = this.utility.generateJWTToken(payload);

          res.status(200).json({
               message: 'Link has been sent to your email',
               token
          });

     }


     @ApiOperation({ summary: 'Signin with Google' })
     @ApiResponse({ type: 'string' })
     @Get('google')
     @UseGuards(GoogleOAuthGuard)
     async googleAuth() { }

     @ApiExcludeEndpoint()
     @Get('google-redirect')
     @UseGuards(GoogleOAuthGuard)
     async googleAuthRedirect(
          @Req() req: Request,
          @Res() res: Response,
     ) {

          const user = <AuthUser>req.user;

          const isUserExist = await this.userService.getUserByEmail(user.email);

          if (isUserExist) {

               const payload = {
                    _id: isUserExist._id,
                    email: user.email
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
                    email: user.email,
                    name: user.name,
                    role: Role.OWNER,
                    plan: Plan.FREE,
                    users_used: 1,
                    users_limit: 2,
               }

               const response = await this.authService.signup(accountInitalData);
               if (!response) {
                    throw new Exception(
                         `Failed to create an account with Google`,
                         HttpStatus.NOT_IMPLEMENTED
                    );
               }

               const userData = {
                    account_id: response['_id'],
                    email: user.email,
                    name: user.name ? user.name : 'John Doe',
                    role: Role.OWNER,
                    password: '',
                    verified: false,
                    oAuth: true
               }

               const creatUser = await this.userService.createUser(userData)

               const payload = {
                    _id: creatUser._id,
                    email: user.email
               }

               const token = this.utility.generateJWTToken(payload);

               try {
                    await this.mailService.sendWelcomeEmail({ name: user.name, email: user.email, token });
               } catch (e) {
                    console.log('Redis server either not started or stopped.', e)
               }

               // save avatar only in google OAuth case
               const profileInfo = {
                    user_id: creatUser._id,
                    email: user.email,
                    avatar: user['avatar']
               }

               await this.profileService.uploadAvatar(profileInfo);

               const authUser: AuthUser = {
                    account_id: response['account_id'],
                    _id: creatUser._id,
                    email: user.email,
                    role: Role.OWNER,
                    status: Status.ACTIVE,
                    name: user.name,
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