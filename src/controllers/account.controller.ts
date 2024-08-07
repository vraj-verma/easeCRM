import {
     Body,
     Controller,
     Delete,
     Get,
     HttpStatus,
     Put,
     Req,
     Res,
     UseGuards
} from "@nestjs/common";
import {
     ApiOperation,
     ApiResponse,
     ApiTags
} from "@nestjs/swagger";
import { Role } from "../enums/enums";
import { Request, Response } from "express";
import { AuthUser } from "../types/authUser";
import { Account } from "../schemas/account.schema";
import { Roles } from "../security/roles.decorator";
import { RolesGuard } from "../security/roles.guard";
import { JwtAuthGuard } from "../security/jwt.guard";
import { Exception } from "../errors/exception.error";
import { UserService } from "../services/users.service";
import { ValidationPipe } from "../pipes/validation.pipe";
import { ApiKeyService } from "../services/apiKey.service";
import { ProfileService } from "../services/profile.service";
import { AccountService } from "../services/account.service";
import { JoiValidationSchema } from "../validations/schema.validation";

@ApiTags('Account Controller')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('account')
export class AccountController {

     constructor(
          private accountService: AccountService,
          private userService: UserService,
          private apiKeyService: ApiKeyService,
          private profileService: ProfileService,
     ) { }

     @ApiOperation({ summary: 'Get an Account' })
     @ApiResponse({ type: Account })
     @Get()
     async getAccount(
          @Req() req: Request,
          @Res() res: Response
     ) {

          const { account_id } = <AuthUser>req.user;

          const response = await this.accountService.getAccount(account_id);

          if (!response) {
               throw new Exception(
                    `No account found`,
                    HttpStatus.NOT_FOUND
               );
          }

          res.status(200).json(response);
     }

     @ApiOperation({ summary: 'Update an Account' })
     @ApiResponse({ type: 'string' })
     @Roles(Role.OWNER, Role.ADMIN)
     @Put()
     async updateAccount(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.accountUpdateSchema)) account: Account
     ) {
          const { account_id, role } = <AuthUser>req.user;

          if (!role.includes(Role.OWNER) && !role.includes(Role.ADMIN)) {
               throw new Exception(
                    `Your current role: ${role}, does not allow access to this.`,
                    HttpStatus.UNAUTHORIZED
               );
          }
          const response = await this.accountService.updateAccount(account_id, account);
  
          if (!response) {
               throw new Exception(
                    `Failed to update account`,
                    HttpStatus.BAD_REQUEST
               );
          };

          res.status(201).json(
               {
                    message: 'Account update successfully'
               }
          )
     }

     @ApiOperation({ summary: 'Delete an Account' })
     @ApiResponse({ type: 'string' })
     @Roles(Role.OWNER)
     @Delete()
     async deleteAccount(
          @Req() req: Request,
          @Res() res: Response,
     ) {
          const { account_id } = <AuthUser>req.user;

          const response = await this.accountService.deleteAccount(account_id);

          if (!response) {
               throw new Exception(
                    `Failed to delete account`,
                    HttpStatus.BAD_REQUEST
               );
          }

          Promise.all([
               this.userService.deleteUsersByAccountId(account_id),
               this.apiKeyService.deleteKeyByAccountId(account_id),
               this.profileService.deleteProfileByAccountId(account_id)
          ])
               .then(() => console.log('All associates docs deleted.'))
               .catch(e => console.log('Failed to delete associates documents', e))

          res.status(200).json(
               {
                    account_id,
                    message: `Account deleted successfully`
               }
          );
     }
}