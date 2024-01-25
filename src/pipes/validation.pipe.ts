import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class ValidationPipe implements PipeTransform {
     constructor(private schema: ObjectSchema) { }

     transform(value: any) {
          const { error, value: schema } = this.schema.validate(value);
          if (error) {
               throw new BadRequestException(error.details[0].message.replace(/([^A-Za-z0-9\s_]+)/g, ''))
          }
          return schema;
     }
}