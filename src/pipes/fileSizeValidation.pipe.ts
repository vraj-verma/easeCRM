import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
     transform(value: any) {
          // "value" is an object containing the file's attributes and metadata
          return value.size < 87587;
     }
}