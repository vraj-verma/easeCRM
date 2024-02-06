import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Profile, ProfileDocument } from "src/schemas/profile.schema";

@Injectable()
export class ProfileService {
     constructor(
          @InjectModel(Profile.name) private db: Model<ProfileDocument>
     ) { }

     async uploadAvatar(profile: Profile) {
          const response = await this.db.create(profile);
          return response ? response : null;
     }
}