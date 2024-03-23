import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Address} from "../types/account";
import { ApiProperty } from "@nestjs/swagger";
import { Plan, Role, Status } from "../enums/enums";

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {

     @ApiProperty({ required: false })
     @Prop({ default: Role.OWNER })
     role?: Role;

     @ApiProperty({ required: false })
     @Prop({ maxlength: 100 })
     bio?: string;

     @ApiProperty({ required: false })
     @Prop({ default: Plan.FREE })
     plan?: Plan;

     @ApiProperty({ required: false })
     @Prop()
     avatar?: string;

     @ApiProperty({ required: false })
     @Prop({ default: Status.ACTIVE })
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