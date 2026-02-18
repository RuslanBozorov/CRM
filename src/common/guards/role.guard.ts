import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflactor: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflactor.get('roles', context.getHandler());
    const req = context.switchToHttp().getRequest();

    if (!roles.includes(req['user'].role)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
