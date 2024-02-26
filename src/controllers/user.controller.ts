import { Body, Controller, HttpException, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { UserService } from "../services/users.service";
import { User } from "../types/user";
import { JwtAuthGuard } from "src/security/jwt.guard";
import { AuthUser } from "src/types/authUser";
import { JwtService } from "@nestjs/jwt";

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
     // create and send invite to join over email
     // assign role while creating the user
     // user take the token and set up the password

     constructor(
          private userService: UserService,
          private jwtService: JwtService,
     ) { }

     @Post('invite')
     async createUser(
          @Req() req: Request,
          @Res() res: Response,
          @Body() user: User
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
}