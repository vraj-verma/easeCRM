import { HttpException, HttpStatus } from "@nestjs/common";

export class Exception extends HttpException {
     constructor(message: string, statusCode: any) {
          super(message, statusCode)
     }
}