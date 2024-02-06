import { Document } from "mongoose";
import {
     Prop,
     Schema,
     SchemaFactory
} from "@nestjs/mongoose";

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {

     @Prop()
     user_id: string;

     @Prop()
     email?: string;

     @Prop()
     avatar?: string;

}

export const ProfileSchema = SchemaFactory.createForClass(Profile);