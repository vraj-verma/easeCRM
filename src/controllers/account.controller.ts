import { Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { AccountService } from "src/services/account.service";
import { AuthUser } from "src/types/authUser";

@Controller()
export class AccountController {

     constructor(
          private accountService: AccountService
     ) { }

     @Get()
     async getAccount(
          @Req() req: Request,
          @Res() res: Response
     ) {

          const authUser = <AuthUser>req.user;

          // const 
     }
}