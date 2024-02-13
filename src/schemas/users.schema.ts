import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types, model } from "mongoose";
import { Role } from "../types/authUser";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

     // @Prop()
     user_id?: Types.ObjectId | string;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
     account_id: Types.ObjectId | string;

     @Prop()
     name: string;

     @Prop()
     email?: string;

     @Prop()
     password?: string;

     @Prop()
     role: Role;

     @Prop({ default: false })
     verified?: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);