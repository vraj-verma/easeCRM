import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logs, LogsDocument } from '../schemas/logs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

     constructor(
          @InjectModel(Logs.name) private logsModel: Model<LogsDocument>,
     ) { }

     private logger = new Logger();
     async use(req: Request, res: Response, next: NextFunction) {

          this.logger.warn(`Logging HTTP request: METHOD-> ${req.method}, SLUG-> ${req.url}, STATUSCODE -> ${res.statusCode}`);

          const requestLog = {
               method: req.method,
               url: req.baseUrl,
               statusCode: res.statusCode,
               user: req.body.name || req.body.email || ''
          }

          await this.logsModel.create(requestLog);

          next();
     }
}

