import {
    Prop,
    Schema,
    SchemaFactory
} from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "../types/authUser";

export type ApiKeyDocument = ApiKey & Document

@Schema({ timestamps: true })
export class ApiKey {

    @Prop()
    apiKey?: string;

    @Prop()
    account_id?: string;

    @Prop()
    name: string;

    @Prop()
    role: Role;

    @Prop({ default: true })
    is_enabled?: boolean;

}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

