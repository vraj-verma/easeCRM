import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User as userType } from "../types/user";
import { User, UserDocument } from "../schemas/users.schema";

@Injectable()
export class UserService {
     constructor(
          @InjectModel(User.name) private db: Model<UserDocument>
     ) { }

     async createUser(user: userType) {
          const response = await this.db.create(user);
          return response ? response._id : null
     }

     async getUserByEmail(email: string) {
          const response = await this.db.aggregate([
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
                    },
               },
          ]);

          return response ? response[0] : null;
     }

     async verfiyUser(email: string) {
          // const response = await this.db.aggregate(
          //      [
          //           {
          //                $match: { email }
          //           },
          //           {
          //                $set: {
          //                     verify: true
          //                }
          //           }
          //      ]
          // );

          const response = await this.db.updateOne(
               {
                    email
               },
               {
                    $set: {
                         verify: true
                    }
               }
          );

          return response ? response : null;
     }



     async getApiKey(apiKey: string) {
          return null;
     }
}