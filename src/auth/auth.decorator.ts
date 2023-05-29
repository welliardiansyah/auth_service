import {
  UseGuards,
  createParamDecorator,
  ExecutionContext,
  applyDecorators,
  Inject,
} from '@nestjs/common';
import { IApplyDecorator } from 'src/response/response.interface';
import { JwtGuard } from '../hash/guard/jwt/jwt.guard';

export function AuthJwtGuard(): IApplyDecorator {
  return applyDecorators(UseGuards(JwtGuard));
}

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext): Record<string, any> => {
    const { user } = ctx.switchToHttp().getRequest();
    return data ? user[data] : user;
  },
);

export function Response(): (
  target: Record<string, any>,
  key: string | symbol | boolean,
  index?: number,
) => void {
  return Inject(`ResponseService`);
}

export function Message(): (
  target: Record<string, any>,
  key: string | symbol,
  index?: number,
) => void {
  return Inject(`MessageService`);
}
