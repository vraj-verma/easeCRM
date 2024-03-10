import { SetMetadata } from '@nestjs/common';

export const MyRoles = (...roles: string[]) => SetMetadata('roles', roles);
