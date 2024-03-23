import {
     Injectable,
     CanActivate,
     ExecutionContext,
     HttpException,
     HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
     constructor(private readonly reflector: Reflector) { }

     canActivate(context: ExecutionContext): boolean {
          const roles = this.reflector.get<string[]>('roles', context.getHandler());
          
          if (!roles) {
               return true;
          }
          const request = context.switchToHttp().getRequest();
          const user = request.user;

          if (!user || !user.role) {
               throw new HttpException(
                    `Your current role: ${user.role} does not have permission to use this API. Please contact your Admin.`,
                    HttpStatus.FORBIDDEN,
               );
          }
          const userRole: string = user.role.trim();
          if (!roles.includes(userRole)) {
               throw new HttpException(
                    `Your current role: ${userRole} does not have permission to use this API. Please contact your Admin.`,
                    HttpStatus.FORBIDDEN,
               );
          }
          return true;
     }
}