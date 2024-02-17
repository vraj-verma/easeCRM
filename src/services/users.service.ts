import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User as userType } from "../types/user";
import { User, UserDocument } from "../schemas/users.schema";

@Injectable()
export class UserService {
     constructor(
          @InjectModel(User.name) private userDB: Model<UserDocument>
     ) { }

     async createUser(user: userType) {
          const response = await this.userDB.create(user);
          return response ? response._id : null
     }

     async getUserByEmail(email: string) {
          const response = await this.userDB.aggregate(
               [
                    {
                         $match: {
                              email,
                         },
                    },
                    {
                         $lookup: {
                              from: "accounts",
                              localField: "account_id",
                              foreignField: "_id",
                              as: "account",
                         },
                    },
                    {
                         $unwind: "$account",
                    },
                    {
                         $project: {
                              __v: 0,
                              'account._id': 0,
                              'account.__v': 0,
                              'account.role': 0,
                         },
                    },
               ]
          );

          return response ? response[0] : null;
     }

     async verfiyUser(email: string): Promise<boolean> {
          const response = await this.userDB.updateOne(
               {
                    email
               },
               {
                    $set: {
                         verified: true
                    }
               }
          )

          return response ? response.modifiedCount > 0 : false;
     }

     async getUserByAccountId(account_id: string) {
          const response = await this.userDB.findOne({ account_id }).lean();
          return response ? response : null;
     }

}