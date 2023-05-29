import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  Inject,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseFilter } from 'src/response/response.filter';
import { ResponseInterceptor } from 'src/response/response.interceptor';
import { IApplyDecorator } from 'src/response/response.interface';

export function ResponseStatusCode(): IApplyDecorator {
  return applyDecorators(
    UseInterceptors(ResponseInterceptor),
    UseFilters(ResponseFilter),
  );
}

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

export function Hash(): (
  target: Record<string, any>,
  key: string | symbol,
  index?: number,
) => void {
  return Inject(`HashService`);
}

// export function AuthJwtGuard(): IApplyDecorator {
//   return applyDecorators(UseGuards(JwtGuard));
// }

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext): Record<string, any> => {
    const { user } = ctx.switchToHttp().getRequest();
    return data ? user[data] : user;
  },
);
