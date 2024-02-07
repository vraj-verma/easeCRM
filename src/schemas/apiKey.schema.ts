import {
    Prop,
    Schema,
    SchemaFactory
} from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ApiKeyDocument = ApiKey & Document

@Schema({ timestamps: true })
export class ApiKey {

    @Prop()
    apiKey?: string;

    @Prop()
    account_id?: string;

}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);