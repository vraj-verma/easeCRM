import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true })
export class Setting {

     @Prop()
     company_name?: string;

     @Prop()
     website?: string;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
     biiling_name?: string;

     @Prop()
     billing_address?: string;

     @Prop()
     country?: string;

     @Prop()
     phone?: number;

}

export const settingSchema = SchemaFactory.createForClass(Setting);