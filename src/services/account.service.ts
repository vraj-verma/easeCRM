import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Account, AccountDocument } from "src/schemas/account.schema";

@Injectable()
export class AccountService {
     
     constructor(
          @InjectModel(Account.name) private accountDB: Model<AccountDocument>
     ) { }
}