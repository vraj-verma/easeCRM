import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";
import { Signup } from "../types/signup";

@Controller('/v1/api/auth/')
export class AuthController {
     constructor(
          private authService: AuthService,
     ) { }

     @Post('signup')
     async signup(
          @Req() req: Request,
          @Res() res: Response,
          @Body() data: Signup,
     ) {
          // const isaAreadyExist = await this.authService

          const response = await this.authService.signup(data);
          if (!response) {
               throw new HttpException(
                    `Account not created`,
                    HttpStatus.BAD_REQUEST
               )
          }

          res.status(201).json(response);
     }
}