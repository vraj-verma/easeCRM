import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Profile, ProfileDocument } from "../schemas/profile.schema";

@Injectable()
export class ProfileService {
     constructor(
          @InjectModel(Profile.name) private profileDB: Model<ProfileDocument>,
     ) { }

     async uploadAvatar(profile: Profile): Promise<any> {
          const response = await this.profileDB.create(profile);
          return response ? response : null;
     }

     async removeAvatar(avatar: string): Promise<any> {
          const response = await this.profileDB.deleteOne({ avatar });
          return response ? response : null;
     }

     // at time of account delete
     async deleteProfileByAccountId(account_id: string): Promise<boolean> {
          const response = await this.profileDB.deleteMany({ account_id });
          return response ? response.deletedCount > 0 : false;
     }
}