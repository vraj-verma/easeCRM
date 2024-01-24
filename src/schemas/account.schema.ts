import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types, model } from "mongoose";
import { Address, Plan } from "../types/account";
import { Role } from "../types/authUser";

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {

     // @Prop()
     account_id?: Types.ObjectId | string;

     @Prop({ default: Role.owner })
     role: Role;

     @Prop({ maxlength: 100 })
     bio?: string;

     @Prop({ default: Plan.free })
     plan: Plan;

     @Prop()
     avatar?: string;

     @Prop()
     users_limit?: number;

     @Prop()
     users_used?: number;

     // @Prop()
     // address?: Address;

}

export const AccountSchema = SchemaFactory.createForClass(Account);