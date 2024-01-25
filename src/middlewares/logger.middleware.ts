import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
     private logger = new Logger(`LOGS`);
     use(req: Request, res: Response, next: NextFunction) {
          this.logger.log(`Logging HTTP request: METHOD-> ${req.method} - SLUG-> ${req.url} - STATUSCODE -> ${res.statusCode}`);
          next();
     }
}

