import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Account, AccountDocument } from "../schemas/account.schema";
import { Signup } from "../types/signup";
import { User } from "src/types/user";

@Injectable()
export class AuthService {
     verfiyUser(email: any) {
          throw new Error("Method not implemented.");
     }
     constructor(
          @InjectModel(Account.name) private accountDB: Model<AccountDocument>
     ) { }


     async signup(user: User): Promise<string> {
          const response = await this.accountDB.create(user);
          return response ? response._id : null;
     }

     async googleOAuth(req) {
          if (!req) {
               throw new HttpException(
                    `No User found`, HttpStatus.BAD_REQUEST
               )
          }

          console.log(req);

          return true;
     }

}