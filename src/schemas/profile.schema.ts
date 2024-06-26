import mongoose, { Document } from "mongoose";
import {
     Prop,
     Schema,
     SchemaFactory
} from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
     user_id: string

     @ApiProperty({ required: false })
     @Prop()
     email?: string;

     @ApiProperty({ required: true })
     @Prop()
     avatar: string;

}

export const ProfileSchema = SchemaFactory.createForClass(Profile);