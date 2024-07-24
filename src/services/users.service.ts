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
          try {
               const response = await this.userDB.create(user);
               return response ? response._id : null;
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     async getUserByEmail(email: string) {
          try {
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
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
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
          try {
               const response = await this.userDB.findOne({ account_id }).lean();
               return response ? response : null;
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     async getUserByUserId(user_id: string, account_id: string) {
          try {
               const filter = { _id: user_id, account_id };
               const response = await this.userDB.findById(filter, { __v: 0 }).lean();
               return response ? response : null;
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     async deleteUsersByAccountId(account_id: string) {
          try {
               const response = await this.userDB.deleteMany({ account_id });
               return response ? response.deletedCount > 0 : false;
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     // modified version
     async getUserByEmailId(email: string): Promise<User> {
          try {
               const response = await this.userDB.findOne({ email }).lean();
               return response ? response as User : null
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     async updatePassword(_id: string, password: string): Promise<boolean> {
          try {
               const response = await this.userDB.updateOne(
                    {
                         _id
                    },
                    {
                         $set: {
                              password
                         }
                    }
               );

               return response ? response.modifiedCount > 0 : false;
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     async getUsers(): Promise<any> {
          try {
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
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     async deleteUser(user_id: string): Promise<boolean> {
          try {
               const filter = { _id: user_id }
               const response = await this.userDB.deleteOne(filter);
               return response ? response.deletedCount > 0 : false;
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     async setTwoFactorAuthenticationSecret(secret: string, email: string): Promise<boolean> {
          try {
               const response = await this.userDB.updateOne(
                    {
                         email
                    },
                    {
                         $set: {
                              // is2FAEnabled: true,
                              twoFASecrets: secret
                         }
                    }
               );

               return response.modifiedCount > 0 || false;
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }

     async enableTwoFactorAuthentication(email: string): Promise<boolean> {
          try {
               const response = await this.userDB.updateOne(
                    {
                         email
                    },
                    {
                         $set: {
                              is2FAEnabled: true
                         }
                    }
               );

               return response.modifiedCount > 0 || false;
          } catch (error) {
               console.log('Something went wrong', error);
               return;
          }
     }


}