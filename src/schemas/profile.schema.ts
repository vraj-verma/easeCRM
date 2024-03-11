import { Document } from "mongoose";
import {
     Prop,
     Schema,
     SchemaFactory
} from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {

     @ApiProperty({ required: false })
     @Prop()
     _id?: string;

     @ApiProperty({ required: false })
     @Prop()
     email?: string;

     @ApiProperty({ required: true })
     @Prop()
     avatar: string;

}

export const ProfileSchema = SchemaFactory.createForClass(Profile);