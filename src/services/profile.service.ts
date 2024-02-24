import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Profile, ProfileDocument } from "src/schemas/profile.schema";

@Injectable()
export class ProfileService {
     constructor(
          @InjectModel(Profile.name) private profileDB: Model<ProfileDocument>
     ) { }

     async uploadAvatar(profile: Profile) {
          const response = await this.profileDB.create(profile);
          return response ? response : null;
     }

     // at time of account delete
     async deleteProfileByAccountId(account_id: string) {
          const response = await this.profileDB.deleteMany({ account_id });
          return response ? response.deletedCount > 0 : false;
     }
}