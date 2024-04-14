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
                              "account.users_limit": 0,
                              "account.users_used": 0,
                              "account.createdAt": 0,
                              "account.updatedAt": 0,
                              "account.address": 0,
                              "account.bio": 0,
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
          );

          return response ? response.modifiedCount > 0 : false;
     }

     async getUserByAccountId(account_id: string) {
          const response = await this.userDB.findOne({ account_id }).lean();
          return response ? response : null;
     }

     async getUserByUserId(user_id: string, account_id: string) {
          const filter = { _id: user_id, account_id };
          const response = await this.userDB.findById(filter, { __v: 0 }).lean();
          return response ? response : null;
     }

     async deleteUsersByAccountId(account_id: string) {
          const response = await this.userDB.deleteMany({ account_id });
          return response ? response.deletedCount > 0 : false;
     }

     // modified version
     async getUserByEmailId(email: string): Promise<User> {
          const response = await this.userDB.findOne({ email }).lean();
          return response ? response as User : null
     }

     async updatePassword(_id: string, password: string): Promise<boolean> {
          const response = await this.userDB.updateOne({ _id },
               {
                    $set: {
                         password
                    }
               }
          );

          return response ? response.modifiedCount > 0 : false;
     }

     async getUsers(): Promise<any> {
          const response = await this.userDB.aggregate(
               [
                    {
                         $group: {
                              _id: null,
                              total_count: { $sum: 1 },
                              users: { $push: "$$ROOT" } // Push all documents into an array
                         }
                    },
                    {
                         $project: {
                              _id: 0,
                              total_count: 1,
                              users: 1
                         }
                    }
               ]
          );

          return response ? response : [];
     }

     async deleteUser(user_id: string): Promise<boolean> {
          const response = (await this.userDB.deleteOne({ user_id }));
          return response ? response.deletedCount > 0 : false;
     }


}