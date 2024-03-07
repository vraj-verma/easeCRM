import {
     Body,
     Controller,
     HttpException,
     HttpStatus,
     Param,
     Post,
     Req,
     Res,
     UseGuards
} from "@nestjs/common";
import { User } from "../types/user";
import { JwtService } from "@nestjs/jwt";
import { AuthUser } from "../types/authUser";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../security/jwt.guard";
import { UserService } from "../services/users.service";
import { ValidationPipe } from "../pipes/validation.pipe";
import { JoiValidationSchema } from "../validations/schema.validation";
import { joinUser } from "src/types/changePassword";
import * as bcrypt from 'bcrypt';


@Controller('user')
export class UserController {
     // create and send invite to join over email -- 
     // assign role while creating the user -- done
     // user take the token and set up the password --

     constructor(
          private userService: UserService,
          private jwtService: JwtService,
     ) { }

     @UseGuards(JwtAuthGuard)
     @Post('invite')
     async createUser(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.inviteUserSchema)) user: User
     ) {
          const { account_id } = <AuthUser>req.user;

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
               user_id: response._id,
               email: user.email
          }

          const token = this.jwtService.sign(payload);

          res.status(201).json(
               {
                    message: `User invitation send to email: ${user.email}`,
                    token
               }
          );

     }

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

          const decodedToken = await this.jwtService.verify(token);

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

          const hash = await bcrypt.hash(joinUser.password, 5);

          const setPassword = await this.userService.updatePassword(decodedToken.user_id, hash);

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

}