import {
    Prop,
    Schema,
    SchemaFactory
} from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "../types/authUser";
import { ApiProperty } from "@nestjs/swagger";

export type ApiKeyDocument = ApiKey & Document

@Schema({ timestamps: true })
export class ApiKey {

    @ApiProperty({ required: false })
    @Prop()
    apiKey?: string;

    @ApiProperty({ required: false })
    @Prop()
    account_id?: string;

    @ApiProperty({ required: true })
    @Prop()
    name: string;

    @ApiProperty({ required: true })
    @Prop()
    role: Role;

    @ApiProperty({ required: false, default: true })
    @Prop({ default: true })
    is_enabled?: boolean;

}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

