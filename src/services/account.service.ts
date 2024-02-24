import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Account, AccountDocument } from "../schemas/account.schema";

@Injectable()
export class AccountService {

     constructor(
          @InjectModel(Account.name) private accountDB: Model<AccountDocument>
     ) { }

     async getAccount(account_id: string): Promise<Account> {
          const response = await this.accountDB.findOne({ _id: account_id }, { __v: 0 });
          return response ? response as unknown as Account : null;
     }

     async getAccountById(account_id: string) {
          const response = await this.accountDB.aggregate(
               [
                    {
                         $match: { _id: new Types.ObjectId(account_id) }
                    },
                    {
                         $lookup: {
                              from: "users",
                              localField: "_id",
                              foreignField: "account_id",
                              as: "result",
                         },
                    },
                    {
                         $unwind: {
                              path: "$result",
                         },
                    },
               ]
          );
          return response ? response[0] : null;
     }

     async updateAccount(account_id: string, account: Account): Promise<Boolean> {
          const filter = { _id: account_id };
          const response = await this.accountDB.updateOne(filter,
               {
                    $set: account
               }
          );

          return response ? response.modifiedCount > 0 : false;
     }

     async deleteAccount(account_id: string) {
          const response = await this.accountDB.deleteOne({ _id: account_id });
          return response ? response.deletedCount > 0 : false;
     }
}