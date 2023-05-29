import { HttpService } from '@nestjs/axios';
import {
  HttpStatus,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, firstValueFrom, catchError, EMPTY } from 'rxjs';
import { RMessage } from 'src/response/response.interface';
import { ResponseService } from 'src/response/response.service';
import { AuthTokenResponse } from '../types';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  private LOG_CONTEXT = 'AdminRoleGuard';
  private USER_TYPES_METADATA = 'user_types';
  private USER_TYPES_AND_LEVELS_METADATA = 'user_type_and_levels';

  constructor(
    private readonly httpService: HttpService,
    private readonly responseService: ResponseService,
    private readonly reflector: Reflector,
  ) {}

  private roleAuthError(value: any, property: any, errorMessage: string) {
    const errors: RMessage = {
      value: value,
      property: property,
      constraint: [errorMessage],
    };
    return this.responseService.error(
      HttpStatus.UNAUTHORIZED,
      errors,
      'Role Unauthorize',
    );
  }

  private isAllowedPermission(
    ctx: ExecutionContext,
    userType: string,
    userLevel: string,
  ): boolean {
    const allowedTypes =
      this.reflector.get<string[]>(
        this.USER_TYPES_METADATA,
        ctx.getHandler(),
      ) || [];

    const allowedTypesAndLevels =
      this.reflector.get<string[]>(
        this.USER_TYPES_AND_LEVELS_METADATA,
        ctx.getHandler(),
      ) || [];

    if (allowedTypes.length == 0 && allowedTypesAndLevels.length == 0) {
      Logger.warn(
        `Endpoint API belum di definisikan decorator user types dan levels!`,
        this.LOG_CONTEXT,
      );
      return false;
    }

    let isAllowed = false;

    // allowed types permit all role levels, so no need to check levels.
    if (allowedTypes.length > 0) {
      isAllowed = allowedTypes.includes(userType);

      return isAllowed;
    }

    const curTypeLevel =
      userType === 'admin' ? `${userType}.*` : `${userType}.${userLevel}`;

    isAllowed = allowedTypesAndLevels.includes(curTypeLevel);

    return isAllowed;
  }

  async canActivate(_context: ExecutionContext) {
    const _req = _context.switchToHttp().getRequest();
    if (_req.headers && _req.headers.authorization == undefined)
      throw new UnauthorizedException('Missing authorization header');

    const token = _req.headers.authorization;

    try {
      const headerRequest = {
        'Content-Type': 'application/json',
        Authorization: token,
      };
      const url = `${process.env.BASEURL_AUTH_SERVICE}/api/v1/auth/validate-token`;

      const res = await firstValueFrom<AuthTokenResponse>(
        this.httpService.get(url, { headers: headerRequest }).pipe(
          map((resp) => {
            return resp?.data;
          }),
          catchError((err: any) => {
            Logger.error(err.message, '', 'AdminRoleGuard');

            const { status } = err.response;

            if (status == 401) {
              throw new UnauthorizedException(
                'Invalid Auth Token validation from Auth Service, please refresh your token!',
                'Auth Token Validation Error',
              );
            }
            return EMPTY;
          }),
        ),
      ).then((res) => {
        Logger.log(
          `Auth validate OK! ${JSON.stringify(res.data)}`,
          'Admin Role Guard',
        );
        return res;
      });

      const { user_type, level } = res?.data?.payload;
      const isAllowed = this.isAllowedPermission(_context, user_type, level);
      if (!isAllowed) {
        const currTypeLevel = `${user_type}.${
          level === undefined ? '*' : level
        }`;
        throw new UnauthorizedException(
          this.roleAuthError(
            currTypeLevel,
            'user_type_and_level',
            `Unauthorized Access! user_type dan level anda tidak diperbolehkan mengakses API ini!`,
          ),
        );
      }

      // pass validated token to controller
      _req.user = Object.assign({}, res.data.payload);

      return true;
    } catch (e) {
      Logger.error('ERROR! Validate Auth StoreGuard: ', e.message);
      throw e;
    }
  }
}
