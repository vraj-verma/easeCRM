import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../enums/enums";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

     @ApiProperty({ required: false })
     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
     account_id: Types.ObjectId | string;

     @ApiProperty({ required: true })
     @Prop()
     name: string;

     @ApiProperty({ required: true })
     @Prop()
     email: string;

     @ApiProperty({ required: false })
     @Prop()
     password?: string;

     @ApiProperty({ required: true })
     @Prop()
     role: Role;

     @ApiProperty({ required: false })
     @Prop({ default: false })
     verified?: boolean;

     @ApiProperty({ required: false })
     @Prop({ default: false })
     oAuth?: boolean;

     @ApiProperty({ required: false })
     @Prop({ default: false })
     is2FAEnabled?: boolean;

     @ApiProperty({ required: false })
     @Prop({ type: String })
     twoFASecrets?: string;

}

export const UserSchema = SchemaFactory.createForClass(User);