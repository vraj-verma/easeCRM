import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
     user_id: string | Types.ObjectId

     @ApiProperty({ required: true })
     @Prop()
     name: string;

     @ApiProperty({ required: true })
     @Prop()
     email: string;

     @ApiProperty({ required: true })
     @Prop()
     phone: string;

     @ApiProperty({ required: false })
     @Prop()
     company?: string;

     @ApiProperty({ required: false })
     @Prop()
     followup?: Date;

     @ApiProperty({ required: false })
     @Prop()
     source?: string;

     @ApiProperty({ required: false, default: 1 })
     @Prop({ default: 1 })
     hotness?: number;

     @ApiProperty({ required: false })
     @Prop()
     tags?: string[];

     @ApiProperty({ required: false })
     @Prop()
     custom_field?: Object[];
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
