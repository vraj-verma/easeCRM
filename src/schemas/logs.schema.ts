import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type LogsDocument = Logs & Document;

@Schema(
     {
          timestamps: true
     }
)
export class Logs {
     @Prop()
     method?: string;

     @Prop()
     url?: string;

     @Prop()
     statusCode?: number;

     @Prop()
     user?: string;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);