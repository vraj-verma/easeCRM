import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Address, Plan } from "../types/account";
import { Role, Status } from "../types/authUser";
import { ApiProperty } from "@nestjs/swagger";

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {

     @ApiProperty({ required: false })
     @Prop({ default: Role.owner })
     role?: Role;

     @ApiProperty({ required: false })
     @Prop({ maxlength: 100 })
     bio?: string;

     @ApiProperty({ required: false })
     @Prop({ default: Plan.free })
     plan?: Plan;

     @ApiProperty({ required: false })
     @Prop()
     avatar?: string;

     @ApiProperty({ required: false })
     @Prop({ default: Status.active })
     status?: Status;

     @ApiProperty({ required: false })
     @Prop()
     address?: Address;

     @ApiProperty({ required: false })
     @Prop()
     users_limit?: number;

     @ApiProperty({ required: false })
     @Prop()
     users_used?: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);