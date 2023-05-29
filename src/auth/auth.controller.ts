import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Logger,
  Post,
  Put,
} from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { OtpDocument } from 'src/database/entities/otp.entity';
import { MessageService } from 'src/message/message.service';
import { ResponseStatusCode } from 'src/response/response.decorator';
import { RMessage } from 'src/response/response.interface';
import { ResponseService } from 'src/response/response.service';
import { AuthJwtGuard } from './auth.decorator';
import { AuthService } from './auth.service';
import { AuthOtpLoginValidation } from './validation/auth.otp_login.validation';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
    private readonly messageService: MessageService,
  ) {}

  @Post('otp-login-phone')
  async otpLoginPhone(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const logger = new Logger();
    const http_req: Record<string, any> = {
      phone: data.phone,
      name: data.name,
    };
    const url: string = process.env.BASEURL_SMS_SERVICE + '/api/v1/sms';
    const messageHandler: Record<string, any> = {
      property: 'otp_code',
      map: 'auth.create.fail',
    };
    const exist_otp_phone: OtpDocument =
      await this.authService.findOneOtpLoginByPhone(data.phone);
    if (exist_otp_phone) {
      if (!exist_otp_phone.validated) {
        const isexp: boolean = await this.authService.checkExpirationTime(
          exist_otp_phone.updated_at,
          Number(process.env.OTP_REG_EXPTIME || 60),
        );
        if (!isexp) {
          const errors: RMessage = {
            value: data.phone,
            property: 'phone',
            constraint: [this.messageService.get('auth.create.waitexp')],
          };
          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            errors,
            'Bad Request',
          );
        }
      }
    }

    return (
      await this.authService.postHttp(url, http_req, messageHandler)
    ).pipe(
      map(async (response) => {
        data.otp_code = response.data.otp_code;
        data.referral_code = 'login';
        try {
          if (exist_otp_phone) {
            data.id_otp = exist_otp_phone.id;
            await this.authService.updateOTP(data);
          } else {
            await this.authService.createOTP(data);
          }
          logger.log(
            'Create OTP for ' + data.phone + ' :' + data.otp_code,
            'CtrlCreateOTP ',
          );

          if (process.env.NODE_ENV === 'test') {
            return { status: true, otp: data.otp_code };
          } else {
            return { status: true };
          }
        } catch (err: any) {
          logger.error(err, 'create try catch');
          const errors: RMessage = {
            value: data.phone,
            property: 'phone',
            constraint: [this.messageService.get('auth.create.invalid')],
          };
          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            errors,
            'Bad Request',
          );
        }
      }),
      catchError(() => {
        const errors: RMessage = {
          value: '',
          property: '',
          constraint: [this.messageService.get('auth.create.fail')],
        };
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.INTERNAL_SERVER_ERROR,
            errors,
            'Internal Server Error',
          ),
        );
      }),
    );
  }

  @Post('otp-login-phone-validation')
  async validateOtpLoginPhone(
    @Body()
    data: AuthOtpLoginValidation,
  ): Promise<any> {
    const existphone: OtpDocument =
      await this.authService.findOneOtpLoginByPhone(data.phone);
    if (!existphone) {
      const errors: RMessage = {
        value: data.phone,
        property: 'phone',
        constraint: [this.messageService.get('auth.validate.invalid')],
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
    if (existphone.otp_code != data.otp_code) {
      const errors: RMessage = {
        value: data.otp_code,
        property: 'otp_code',
        constraint: [this.messageService.get('auth.validate.invalid_otp')],
      };

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
    try {
      existphone.validated = true;
      this.authService.updateFullOtp(existphone);

      //Create Token
      // const { id, user_type, roles } = data;
      const data_token = {
        id: data.id,
        user_type: data.user_type,
        roles: data.roles,
        level: data.level,
        group_id: data.group_id,
        merchant_id: data.merchant_id,
        store_id: data.store_id,
        created_at: data.created_at,
      };
      const accessToken: string = await this.authService.createAccessToken(
        data_token,
      );

      const refreshtoken: string =
        await this.authService.createAccessRefreshToken(data_token);
      if (!refreshtoken) {
        const errors: RMessage = {
          value: '',
          property: 'token',
          constraint: [this.messageService.get('auth.login.invalid_token')],
        };
        return this.responseService.error(
          HttpStatus.UNAUTHORIZED,
          errors,
          'UNAUTHORIZED',
        );
      }
      return this.responseService.success(
        true,
        this.messageService.get('auth.validate.success'),
        {
          token: accessToken,
          refreshtoken: refreshtoken,
        },
      );
    } catch (err: any) {
      const errors: RMessage = {
        value: data.otp_code,
        property: 'otp_code',
        constraint: [this.messageService.get('auth.validate.invalid_otp')],
      };

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
  }

  @Post('otp-login-email')
  async otpLoginEmail(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const logger = new Logger();
    const http_req: Record<string, any> = {
      email: data.email,
      name: data.name,
    };
    const url: string = process.env.BASEURL_EMAIL_SERVICE + '/api/v1/email';
    const messageHandler: Record<string, any> = {
      property: 'otp_code',
      map: 'auth.create.fail',
    };
    const exist_otp_email: OtpDocument =
      await this.authService.findOneOtpLoginByEmail(data.email);
    if (exist_otp_email) {
      const isexp: boolean = await this.authService.checkExpirationTime(
        exist_otp_email.updated_at,
        Number(process.env.OTP_REG_EXPTIME || 60),
      );
      if (!isexp) {
        const errors: RMessage = {
          value: data.email,
          property: 'email',
          constraint: [this.messageService.get('auth.create.waitexp')],
        };
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }

    return (
      await this.authService.postHttp(url, http_req, messageHandler)
    ).pipe(
      map(async (response) => {
        data.otp_code = response.data.otp_code;
        data.user_type = 'login';
        try {
          if (exist_otp_email) {
            data.id_otp = exist_otp_email.id;
            await this.authService.updateOTP(data);
          } else {
            await this.authService.createOTP(data);
          }
          logger.log(
            'Create OTP for ' + data.email + ' :' + data.otp_code,
            'CtrlCreateOTP Email',
          );

          if (process.env.NODE_ENV === 'test') {
            return { status: true, otp: data.otp_code };
          } else {
            return { status: true };
          }
        } catch (err: any) {
          logger.error(err, 'create try catch');
          const errors: RMessage = {
            value: data.email,
            property: 'email',
            constraint: [this.messageService.get('auth.create.fail')],
          };
          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            errors,
            'Bad Request',
          );
        }
      }),
      catchError(() => {
        const errors: RMessage = {
          value: '',
          property: '',
          constraint: [this.messageService.get('auth.create.fail')],
        };
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.INTERNAL_SERVER_ERROR,
            errors,
            'Internal Server Error',
          ),
        );
      }),
    );
  }

  @Post('otp-login-email-validation')
  async validateOtpLoginEmail(
    @Body()
    data: AuthOtpLoginValidation,
  ): Promise<any> {
    const otp_login: OtpDocument =
      await this.authService.findOneOtpLoginByEmail(data.email);
    if (!otp_login) {
      const errors: RMessage = {
        value: data.email,
        property: 'email',
        constraint: [this.messageService.get('auth.validate.invalid_email')],
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
    if (otp_login.otp_code != data.otp_code) {
      const errors: RMessage = {
        value: data.otp_code,
        property: 'otp_code',
        constraint: [this.messageService.get('auth.validate.invalid_otp')],
      };

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
    try {
      otp_login.validated = true;
      this.authService.updateFullOtp(otp_login);

      //Create Token
      // const { id, user_type, roles } = data;
      const data_token = {
        id: data.id,
        user_type: data.user_type,
        roles: data.roles,
        level: data.level,
        group_id: data.group_id,
        merchant_id: data.merchant_id,
        store_id: data.store_id,
        created_at: data.created_at,
      };
      const accessToken: string = await this.authService.createAccessToken(
        data_token,
      );

      const refreshtoken: string =
        await this.authService.createAccessRefreshToken(data_token);
      if (!refreshtoken) {
        const errors: RMessage = {
          value: '',
          property: 'token',
          constraint: [this.messageService.get('auth.login.invalid_token')],
        };
        return this.responseService.error(
          HttpStatus.UNAUTHORIZED,
          errors,
          'UNAUTHORIZED',
        );
      }
      return this.responseService.success(
        true,
        this.messageService.get('auth.validate.success'),
        {
          token: accessToken,
          refreshtoken: refreshtoken,
        },
      );
    } catch (err: any) {
      const errors: RMessage = {
        value: data.otp_code,
        property: 'otp_code',
        constraint: [this.messageService.get('auth.validate.invalid_otp')],
      };

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
  }

  @Post('otp-forget-password')
  @ResponseStatusCode()
  async createotpforgetpassword(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const logger = new Logger();
    const http_req: Record<string, any> = {
      phone: data.phone,
    };
    const url: string = process.env.BASEURL_SMS_SERVICE + '/api/v1/sms';
    const messageHandler: Record<string, any> = {
      property: 'otp_code',
      map: 'auth.create.fail',
    };
    const existphone: OtpDocument = await this.authService.findOneOtpByIdPhone(
      data.phone,
      'forget-password',
    );
    if (existphone) {
      if (!existphone.validated) {
        const isexp: boolean = await this.authService.checkExpirationTime(
          existphone.updated_at,
          Number(process.env.OTP_REG_EXPTIME || 60),
        );
        if (!isexp) {
          const errors: RMessage = {
            value: data.phone,
            property: 'phone',
            constraint: [this.messageService.get('auth.create.waitexp')],
          };
          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            errors,
            'Bad Request',
          );
        }
      }
      if (data.phone != existphone.phone) {
        const errors: RMessage = {
          value: data.phone,
          property: 'phone',
          constraint: [this.messageService.get('auth.create.invalid')],
        };
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }

    return (
      await this.authService.postHttp(url, http_req, messageHandler)
    ).pipe(
      map(async (response) => {
        data.otp_code = response.data.otp_code;
        try {
          if (existphone) {
            data.id_otp = existphone.id;
            data.referral_code = existphone.referral_code;
            await this.authService.updateOTP(data);
          } else {
            await this.authService.createOTP(data);
          }
          logger.log(
            'Create OTP for ' + data.phone + ' :' + data.otp_code,
            'CtrlCreateOTP ',
          );

          if (process.env.NODE_ENV === 'test') {
            return { status: true, otp: data.otp_code };
          } else {
            return { status: true };
          }
        } catch (err: any) {
          logger.error(err, 'create try catch');
          const errors: RMessage = {
            value: data.phone,
            property: 'phone',
            constraint: [this.messageService.get('auth.create.invalid')],
          };

          // throw new BadRequestException(
          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            errors,
            'Bad Request',
            // ),
          );
        }
      }),
      catchError(() => {
        const errors: RMessage = {
          value: '',
          property: 'http',
          constraint: [this.messageService.get('auth.create.fail')],
        };
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.INTERNAL_SERVER_ERROR,
            errors,
            'Internal Server Error',
          ),
        );
      }),
    );
  }

  @Post('otp')
  async createotp(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const logger = new Logger();

    const http_req: Record<string, any> = {
      phone: data.phone,
      name: data.name,
    };

    const url: string = process.env.BASEURL_SMS_SERVICE + '/api/v1/sms';

    const messageHandler: Record<string, any> = {
      property: 'otp_code',
      map: 'auth.create.fail',
    };

    const existphone: OtpDocument = await this.authService.findOneOtpByIdPhone(
      data.phone,
      'registration',
    );

    if (existphone) {
      const isexp: boolean = await this.authService.checkExpirationTime(
        existphone.updated_at,
        Number(process.env.OTP_REG_EXPTIME || 60),
      );

      if (!isexp) {
        const errors: RMessage = {
          value: data.phone,
          property: 'phone',
          constraint: [this.messageService.get('auth.create.waitexp')],
        };

        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }

    return (
      await this.authService.postHttp(url, http_req, messageHandler)
    ).pipe(
      map(async (response) => {
        data.otp_code = response.data.otp_code;

        console.log(data.otp_code);

        try {
          if (existphone) {
            data.id_otp = existphone.id;

            data.referral_code = existphone.referral_code;

            await this.authService.updateOTP(data);
          } else {
            await this.authService.createOTP(data);
          }

          logger.log(
            'Create OTP for ' + data.phone + ' :' + data.otp_code,
            'CtrlCreateOTP ',
          );

          if (process.env.NODE_ENV === 'test') {
            return { status: true, otp: data.otp_code };
          } else {
            return { status: true };
          }
        } catch (err: any) {
          logger.error(err, 'create try catch');
          const errors: RMessage = {
            value: data.phone,
            property: 'phone',
            constraint: [this.messageService.get('auth.create.invalid')],
          };
          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            errors,
            'Bad Request',
          );
        }
      }),
      catchError(() => {
        const errors: RMessage = {
          value: '',
          property: '',
          constraint: [this.messageService.get('auth.create.fail')],
        };
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.INTERNAL_SERVER_ERROR,
            errors,
            'Internal Server Error',
          ),
        );
      }),
    );
  }

  @Post('otp-validation')
  async validateeotp(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const existphone: OtpDocument = await this.authService.findOneOtpByIdPhone(
      data.phone,
      'registration',
    );

    if (!existphone) {
      const errors: RMessage = {
        value: data.phone,
        property: 'phone',
        constraint: [this.messageService.get('auth.validate.invalid')],
      };

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    } else {
      if (existphone.otp_code != data.otp_code) {
        const errors: RMessage = {
          value: data.otp_code,
          property: 'otp_code',
          constraint: [this.messageService.get('auth.validate.invalid_otp')],
        };

        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }

      try {
        existphone.validated = true;

        this.authService.updateFullOtp(existphone);

        //Create Token
        const param_token = {
          id: data.id,
          user_type: data.user_type,
          roles: data.roles,
          created_at: data.created_at,
        };

        const accessToken: string = await this.authService.createAccessToken(
          param_token,
        );

        const refreshtoken: string =
          await this.authService.createAccessRefreshToken(param_token);

        const rdata: Record<string, string> = {
          token: accessToken,
          refreshtoken,
        };

        return this.responseService.success(
          true,
          this.messageService.get('auth.validate.success'),
          rdata,
        );
      } catch (err: any) {
        const errors: RMessage = {
          value: data.otp_code,
          property: 'otp_code',
          constraint: [this.messageService.get('auth.validate.invalid_otp')],
        };

        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }
  }

  @Post('otp/corporate')
  async createOtpCorporate(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const logger = new Logger();

    const http_req: Record<string, any> = {
      phone: data.phone,
      name: data.name,
    };

    const url: string = process.env.BASEURL_SMS_SERVICE + '/api/v1/sms';

    const messageHandler: Record<string, any> = {
      property: 'otp_code',
      map: 'auth.create.fail',
    };

    const existPhone: OtpDocument =
      await this.authService.findOneOtpByIdPhoneAndGroup(
        data.phone,
        'update_corporate',
        data.group_id,
      );

    if (existPhone) {
      const isExpired: boolean = await this.authService.checkExpirationTime(
        existPhone.updated_at,
        Number(process.env.OTP_REG_EXPTIME || 60),
      );

      if (!isExpired) {
        const errors: RMessage = {
          value: data.phone,
          property: 'phone',
          constraint: [this.messageService.get('auth.create.waitexp')],
        };

        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }

    return (
      await this.authService.postHttp(url, http_req, messageHandler)
    ).pipe(
      map(async (response) => {
        data.otp_code = response.data.otp_code;

        try {
          if (existPhone) {
            data.id_otp = existPhone.id;

            data.referral_code = existPhone.referral_code;

            await this.authService.updateOTP(data);
          } else {
            await this.authService.createOTP(data);
          }

          if (process.env.NODE_ENV === 'test') {
            return { status: true, otp: data.otp_code };
          } else {
            return { status: true };
          }
        } catch (err: any) {
          logger.error(err, 'create try catch');

          const errors: RMessage = {
            value: data.phone,
            property: 'phone',
            constraint: [this.messageService.get('auth.create.invalid')],
          };

          return this.responseService.error(
            HttpStatus.BAD_REQUEST,
            errors,
            'Bad Request',
          );
        }
      }),
      catchError(() => {
        const errors: RMessage = {
          value: '',
          property: '',
          constraint: [this.messageService.get('auth.create.fail')],
        };

        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.INTERNAL_SERVER_ERROR,
            errors,
            'Internal Server Error',
          ),
        );
      }),
    );
  }

  @Post('otp-validation/corporate')
  async validateOtpCorporate(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const existphone: OtpDocument =
      await this.authService.findOneOtpByIdPhoneAndGroup(
        data.phone,
        'update_corporate',
        data.group_id,
      );

    if (!existphone) {
      const errors: RMessage = {
        value: data.phone,
        property: 'phone',
        constraint: [this.messageService.get('auth.validate.invalid')],
      };

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    } else {
      if (existphone.otp_code != data.otp_code) {
        const errors: RMessage = {
          value: data.otp_code,
          property: 'otp_code',
          constraint: [this.messageService.get('auth.validate.invalid_otp')],
        };

        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }

      try {
        existphone.validated = true;

        await this.authService.updateFullOtp(existphone);

        return this.responseService.success(
          true,
          this.messageService.get('auth.validate.success'),
          null,
        );
      } catch (err: any) {
        const errors: RMessage = {
          value: data.otp_code,
          property: 'otp_code',
          constraint: [this.messageService.get('auth.validate.invalid_otp')],
        };

        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }
  }

  @AuthJwtGuard()
  @Put('profile')
  async profile(
    @Body()
    data: Record<string, any>,
    @Headers('Authorization') token: string,
  ): Promise<any> {
    token = token.replace('Bearer ', '');
    const payload: Record<string, any> =
      await this.authService.validateAccessToken(token);
    if (!payload) {
      const errors: RMessage = {
        value: token,
        property: 'token',
        constraint: [this.messageService.get('auth.profile.invalid_token')],
      };
      return this.responseService.error(
        HttpStatus.UNAUTHORIZED,
        errors,
        'UNAUTHORIZED',
      );
    }

    const dailytoken: string = await this.authService.createAccessToken({
      id: payload.id,
      user_type: data.user_type,
      roles: data.roles,
      created_at: data.created_at,
    });
    if (!dailytoken) {
      const errors: RMessage = {
        value: token,
        property: 'token',
        constraint: [
          this.messageService.get('auth.profile.invalid_createtoken'),
        ],
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }

    const refreshtoken: string =
      await this.authService.createAccessRefreshToken({
        id: payload.id,
        user_type: data.user_type,
        roles: data.roles,
        created_at: data.created_at,
      });
    if (!refreshtoken) {
      const errors: RMessage = {
        value: token,
        property: 'token',
        constraint: [
          this.messageService.get('auth.profile.invalid_createtoken'),
        ],
      };

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
    const rdata: Record<string, any> = {
      token: dailytoken,
      refreshtoken: refreshtoken,
      payload: payload,
    };

    return this.responseService.success(
      true,
      this.messageService.get('auth.profile.success'),
      rdata,
    );
  }

  @Post('login')
  async login(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    const payload: Record<string, any> = {
      id: data.id_profile,
      user_type: data.user_type,
      roles: data.roles,
    };
    if (data.user_type == 'merchant') {
      payload.level = data.level;
      payload.id = data.id;
      payload.group_id = data.group_id;
      payload.merchant_id = data.merchant_id;
      payload.store_id = data.store_id;
      payload.role_id = data.role_id ? data.role_id : null;
    }

    const dailytoken: string = await this.authService.createAccessToken(
      payload,
    );
    if (!dailytoken) {
      const errors: RMessage = {
        value: '',
        property: 'token',
        constraint: [this.messageService.get('auth.login.invalid_token')],
      };
      return this.responseService.error(
        HttpStatus.UNAUTHORIZED,
        errors,
        'UNAUTHORIZED',
      );
    }
    const refreshtoken: string =
      await this.authService.createAccessRefreshToken(payload);
    if (!refreshtoken) {
      const errors: RMessage = {
        value: '',
        property: 'token',
        constraint: [this.messageService.get('auth.login.invalid_token')],
      };
      return this.responseService.error(
        HttpStatus.UNAUTHORIZED,
        errors,
        'UNAUTHORIZED',
      );
    }
    return this.responseService.success(
      true,
      this.messageService.get('auth.profile.success'),
      {
        token: dailytoken,
        refreshtoken: refreshtoken,
      },
    );
  }

  @Post('refresh-token')
  async refreshToken(
    @Headers('Authorization') token: string,
    @Headers('request-from') service_host: string,
    @Body() data: any,
  ): Promise<any> {
    token = token.replace('Bearer ', '');

    const payload: Record<string, any> =
      await this.authService.validateAccessToken(token);

    if (service_host != payload.user_type) {
      const errors: RMessage = {
        value: '',
        property: 'refresh_token',
        constraint: [
          this.messageService.get('auth.refresh_token.invalid_refreshtoken'),
        ],
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }

    if (!payload) {
      const errors: RMessage = {
        value: '',
        property: 'refresh_token',
        constraint: [
          this.messageService.get('auth.refresh_token.invalid_refreshtoken'),
        ],
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
    delete payload.iat;
    delete payload.exp;
    payload.created_at = data.created_at;
    const dailytoken: string = await this.authService.createAccessToken(
      payload,
    );

    if (!dailytoken) {
      const errors: RMessage = {
        value: '',
        property: 'token',
        constraint: [this.messageService.get('auth.login.invalid_token')],
      };
      return this.responseService.error(
        HttpStatus.UNAUTHORIZED,
        errors,
        'UNAUTHORIZED',
      );
    }
    return this.responseService.success(
      true,
      this.messageService.get('auth.refresh_token.success'),
      {
        token: dailytoken,
      },
    );
  }

  @AuthJwtGuard()
  @Put('reset-password')
  async resetPassword(
    @Body()
    data: Record<string, any>,
    @Headers('Authorization')
    token: string,
  ): Promise<any> {
    token = token.replace('Bearer ', '');
    const payload: Record<string, any> =
      await this.authService.validateAccessToken(token);

    if (!payload) {
      const errors: RMessage = {
        value: token,
        property: 'token',
        constraint: [
          this.messageService.get('auth.reset_password.invalid_token'),
        ],
      };
      return this.responseService.error(
        HttpStatus.UNAUTHORIZED,
        errors,
        'UNAUTHORIZED',
      );
    }
    return this.responseService.success(
      true,
      this.messageService.get('auth.reset_password.success'),
      {
        payload: payload,
      },
    );
  }

  @AuthJwtGuard()
  @Get('validate-token')
  async validateToken(@Headers('Authorization') token: string): Promise<any> {
    token = token.replace('Bearer ', '');
    const payload: Record<string, any> =
      await this.authService.validateAccessToken(token);
    if (!payload) {
      const errors: RMessage = {
        value: token,
        property: 'token',
        constraint: [
          this.messageService.get('auth.validate_token.invalid_token'),
        ],
      };
      return this.responseService.error(
        HttpStatus.UNAUTHORIZED,
        errors,
        'UNAUTHORIZED',
      );
    }
    return this.responseService.success(
      true,
      this.messageService.get('auth.validate_token.success'),
      {
        payload: payload,
      },
    );
  }

  @Post('otp-update-phone')
  async updateOtp(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.updatePhoneOtp(data);
  }

  @Post('otp-phone')
  async otpPhone(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.otpPhone(data);
  }

  @Post('otp-phone-validation')
  async validateeotpPhone(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.otpPhoneValidation(data);
  }

  @Post('otp-email')
  async otpEmail(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.otpEmail(data);
  }

  @Post('otp-email-validation')
  async validateeotpEmail(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.otpEmailValidation(data);
  }

  @Post('otp-phone-problem')
  @ResponseStatusCode()
  async createOtpPhoneProblem(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.createOtpPhoneProblem(data);
  }

  @Post('otp-phone-problem-validation')
  async phoneProblemValidateOtp(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.validateOtpPhoneProblem(data);
  }

  @Post('otp-phone-problem-phonenew')
  @ResponseStatusCode()
  async createOtpPhoneProblemPhoneNew(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.createOtpValidatePhoneNew(data);
  }

  @Post('otp-phone-problem-phonenew-validation')
  async phoneProblemValidateOtpPhoneNew(
    @Body()
    data: Record<string, any>,
  ): Promise<any> {
    return this.authService.validateOtpPhoneProblemPhoneNew(data);
  }
}
