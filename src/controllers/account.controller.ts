import {
     Body,
     Controller,
     Get,
     HttpException,
     HttpStatus,
     Put,
     Req,
     Res,
     UseGuards
} from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../security/jwt.guard";
import { AccountService } from "../services/account.service";
import { AuthUser, Role } from "../types/authUser";
import { Account } from "../schemas/account.schema";
import { ValidationPipe } from "src/pipes/validation.pipe";
import { JoiValidationSchema } from "src/validations/schema.validation";


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

     @Put()
     async updateAccount(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.accountUpdateSchema)) account: Account
     ) {
          const { account_id, role } = <AuthUser>req.user;

          if (!role.includes(Role.owner) && !role.includes(Role.admin)) {
               throw new HttpException(
                    `Your current role: ${role}, does not allow access to this.`,
                    HttpStatus.UNAUTHORIZED
               );
          }
          const response = await this.accountService.updateAccount(account_id, account);

          if (!response) {
               throw new HttpException(
                    `Failed to update account`,
                    HttpStatus.BAD_REQUEST
               )
          };

          res.status(201).json(
               {
                    message: 'Account update successfully'
               }
          )
     }
}