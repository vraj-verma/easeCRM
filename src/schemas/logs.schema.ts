import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type LogsDocument = Logs & Document;

@Schema(
     {
          timestamps: true
     }
)
export class Logs {

     @ApiProperty({ required: false })
     @Prop()
     method?: string;

     @ApiProperty({ required: false })
     @Prop()
     url?: string;

     @ApiProperty({ required: false })
     @Prop()
     statusCode?: number;

     @ApiProperty({ required: false })
     @Prop()
     user?: string;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);