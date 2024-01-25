import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/users.schema";
import { User as userType } from "../types/user";

@Injectable()
export class UserService {
     constructor(
          @InjectModel(User.name) private userDb: Model<UserDocument>
     ) { }

     async createUser(user: userType) {
          const response = await this.userDb.create(user);
          return response ? response._id : null
     }

     async getUserByEmail(email: string) {
          const response = await this.userDb.findOne({ email }).select("-password");
          return response ? response : null;
     }
}