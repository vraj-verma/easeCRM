import {
     PipeTransform,
     Injectable,
     HttpException,
     HttpStatus,
} from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class MongoValidationPipe implements PipeTransform {
     transform(value: any) {
          if (!value) return;

          if (typeof value === 'string' && mongoose.isObjectIdOrHexString(value)) {
               return value;
          }

          value = Array.isArray(value) ? value : value.split(',');
          const isInvalid = value.some(
               (id: string) => !mongoose.isObjectIdOrHexString(id),
          );
          if (isInvalid) {
               throw new HttpException(`Invalid mongo id: ${value}`, HttpStatus.BAD_REQUEST);
          }
          return value;
     }
}
