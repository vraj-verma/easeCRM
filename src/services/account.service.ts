import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Account, AccountDocument } from "src/schemas/account.schema";

@Injectable()
export class AccountService {

     constructor(
          @InjectModel(Account.name) private accountDB: Model<AccountDocument>
     ) { }

     async getAccount(account_id: string): Promise<Account> {
          const response = await this.accountDB.findOne({ _id: account_id }, { __v: 0 });
          return response ? response as unknown as Account : null;
     }
}