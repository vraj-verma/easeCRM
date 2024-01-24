import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Account, AccountDocument } from "../schemas/account.schema";
import { Signup } from "../types/signup";

@Injectable()
export class AuthService {
     constructor(
          @InjectModel(Account.name) private accountDB: Model<AccountDocument>
     ) { }


     async signup(data: Signup): Promise<string> {
          const response = await this.accountDB.create(data);
          return response ? response._id : null;
     }

}