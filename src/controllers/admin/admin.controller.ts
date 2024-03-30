import {
     Controller,
     Get,
     HttpException,
     HttpStatus,
     Query,
     Res
} from "@nestjs/common";
import { Response } from 'express';
import { ApiExcludeController } from "@nestjs/swagger";
import { UserService } from "../../services/users.service";

// internal purpose only
@ApiExcludeController()
@Controller('admin')
export class AdminController {
     constructor(
          private userService: UserService,
     ) { }


     @Get('users')
     async getUsers(
          @Res() res: Response,
          @Query() passcode: string
     ) {

          if (Object.keys(passcode).length == 0 || passcode['passcode'] !== process.env.PASSCODE) {
               throw new HttpException(
                    `Passcode required or incorrect`,
                    HttpStatus.UNAUTHORIZED
               );
          }

          const response = await this.userService.getUsers();
          if (!response) {
               throw new HttpException(
                    `No user(s) found`,
                    HttpStatus.NOT_FOUND
               );
          }

          res.status(200).json(...response);
     }

}