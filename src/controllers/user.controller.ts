import {
     Body,
     Controller,
     Delete,
     HttpException,
     HttpStatus,
     Param,
     Post,
     Req,
     Res,
     UseGuards
} from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { User } from "../types/user";
import { Role } from "../enums/enums";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { AuthUser } from "../types/authUser";
import { joinUser, UpdatePassword } from "../types/changePassword";
import { Roles } from "../security/roles.decorator";
import { RolesGuard } from "../security/roles.guard";
import { JwtAuthGuard } from "../security/jwt.guard";
import { UserService } from "../services/users.service";
import { ValidationPipe } from "../pipes/validation.pipe";
import { MailService } from "../mails/mail-template.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JoiValidationSchema } from "../validations/schema.validation";
import { Utility } from "src/utils/utility";
import { Exception } from "src/errors/exception.error";


@ApiTags('User Controller')
@Controller('user')
export class UserController {

     constructor(
          private userService: UserService,
          private utility: Utility,
          private mailService: MailService,
     ) { }

     @ApiOperation({ summary: 'Invite a new user via email' })
     @ApiResponse({ type: 'string' })
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(Role.OWNER, Role.ADMIN)
     @Post('invite')
     async createUser(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.inviteUserSchema)) user: User
     ) {
          const { account_id, name } = <AuthUser>req.user;

          if (user.role === Role.OWNER) {
               throw new HttpException(
                    `Only one Owner can be exist in an account, please assign other role: ['Admin', 'Viewer]`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const isAlreadyExist = await this.userService.getUserByEmailId(user.email);
          if (isAlreadyExist) {
               throw new HttpException(
                    `User wih email: ${user.email} already exist`,
                    HttpStatus.BAD_REQUEST
               );
          }

          user.account_id = account_id;

          const response = await this.userService.createUser(user);
          if (!response) {
               throw new HttpException(
                    `User did not created, try again`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const payload = {
               _id: response._id,
               email: user.email
          }

          const token = this.utility.generateJWTToken(payload);

          const inviteObj = {
               name,
               invited_username: user.name,
               email: user.email,
               token
          }

          this.mailService.sendInviteEmail(inviteObj);

          res.status(201).json(
               {
                    message: `User invitation sent to email: ${user.email}`,
                    token
               }
          );

     }

     @ApiOperation({ summary: 'Join & Set password' })
     @ApiResponse({ type: 'string' })
     @Post('join/:token')
     async joinUser(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.joinUserSchema)) joinUser: joinUser,
          @Param('token') token: string
     ) {

          if (joinUser.password !== joinUser.confirmPassword) {
               throw new HttpException(
                    `Password and Compare Password are not same`,
                    HttpStatus.BAD_REQUEST
               );
          }

          if (!token) {
               throw new HttpException(
                    `Please provide token`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const decodedToken = await this.utility.verifyJWTToken(token);

          if (!decodedToken) {
               throw new HttpException(
                    `Invalid token or token expired`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const response = await this.userService.getUserByEmailId(decodedToken.email);

          if (response.password) {
               throw new HttpException(
                    `User already joined`,
                    HttpStatus.BAD_REQUEST
               );
          }

          if (!response) {
               throw new HttpException(
                    `No user found with email: ${decodedToken.email}, or user already joined`,
                    HttpStatus.NOT_FOUND
               );
          }

          const hash = await this.utility.encryptPassword(joinUser.password);

          const setPassword = await this.userService.updatePassword(decodedToken._id, hash);

          if (!setPassword) {
               throw new HttpException(
                    `Failed to set password, try again`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(200).json(
               {
                    message: 'Password updated successsfully'
               }
          );


     }

     @ApiOperation({ summary: 'Update password' })
     @ApiResponse({ type: 'string' })
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Post('update-password')
     async updatePassword(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.updatePasswordSchema)) payload: UpdatePassword
     ) {

          const { _id } = <AuthUser>req.user;

          if (payload.password !== payload.confirmPassword) {
               throw new Exception(
                    'Password & Confirm Password mismatched!',
                    HttpStatus.BAD_REQUEST
               );
          }

          const hash = await this.utility.encryptPassword(payload.password);

          const response = await this.userService.updatePassword(_id, hash);

          if (!response) {
               throw new Exception(
                    'Something went wrong',
                    HttpStatus.INTERNAL_SERVER_ERROR
               );
          }

          res.status(200).json(
               {
                    message: 'Password updated successfully.'
               }
          );
     }

     @ApiOperation({ summary: 'Delete logged in user' })
     @ApiResponse({ type: 'string' })
     @UseGuards(JwtAuthGuard)
     @Delete()
     async deleteUser(
          @Req() req: Request,
          @Res() res: Response,
     ) {

          const { _id } = <AuthUser>req.user;

          const response = await this.userService.deleteUser(_id);
          if (!response) {
               throw new Exception(
                    `Something went wrong`,
                    HttpStatus.INTERNAL_SERVER_ERROR
               );
          }

          res.status(200).json({
               message: `User deleted successfully`
          });
     }
}