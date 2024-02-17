import {
     Controller,
     Get,
     HttpException,
     HttpStatus,
     Req,
     Res,
     UseGuards
} from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../security/jwt.guard";
import { AccountService } from "../services/account.service";
import { AuthUser } from "../types/authUser";

@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {

     constructor(
          private accountService: AccountService
     ) { }

     @Get()
     async getAccount(
          @Req() req: Request,
          @Res() res: Response
     ) {

          const { account_id } = <AuthUser>req.user;

          const response = await this.accountService.getAccount(account_id);

          if (!response) {
               throw new HttpException(
                    `No account found`,
                    HttpStatus.NOT_FOUND
               );
          }

          res.status(200).json(response);
     }
}