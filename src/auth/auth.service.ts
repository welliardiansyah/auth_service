import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { isDefined } from 'class-validator';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CommonService } from 'src/common/common.service';
import { OtpDocument } from 'src/database/entities/otp.entity';
import { HashService } from 'src/hash/hash.service';
import { MessageService } from 'src/message/message.service';
import { RMessage } from 'src/response/response.interface';
import { ResponseService } from 'src/response/response.service';
import { Repository, UpdateResult } from 'typeorm';
import { AuthOtpLoginValidation } from './validation/auth.otp_login.validation';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpDocument)
    private readonly otpRepository: Repository<OtpDocument>,
    private readonly messageService: MessageService,
    private readonly responseService: ResponseService,
    private readonly hashService: HashService,
    private httpService: HttpService,
    private readonly commonService: CommonService,
  ) {}

  async postHttp(
    url: string,
    body: Record<string, any>,
    msgHandler: Record<string, any>,
  ): Promise<Observable<AxiosResponse<any>>> {
    return this.httpService.post(url, body).pipe(
      map((response) => response.data),
      catchError((err) => {
        const errors: RMessage = {
          value: '',
          property: msgHandler.property,
          constraint: [this.messageService.get(msgHandler.map)],
        };
        if (err.response == 'undefined') {
          throw new BadRequestException(
            this.responseService.error(
              HttpStatus.INTERNAL_SERVER_ERROR,
              errors,
              'Internal Server Error',
            ),
          );
        }
        throw new BadRequestException(
          this.responseService.error(
            err.response.status,
            errors,
            err.response.data,
          ),
        );
      }),
    );
  }

  async createAccessToken(payload: Record<string, any>): Promise<string> {
    return this.hashService.jwtSign(
      payload,
      process.env.AUTH_JWTEXPIRATIONTIME,
    );
  }

  async createAccessRefreshToken(
    payload: Record<string, any>,
  ): Promise<string> {
    return this.hashService.jwtSign(
      payload,
      process.env.AUTH_REFRESHJWTEXPIRATIONTIME,
    );
  }

  async validateAccessToken(token: string): Promise<Record<string, any>> {
    return this.hashService.jwtPayload(token);
  }

  async findOneOtpByPhone(id: string): Promise<OtpDocument> {
    return this.otpRepository.findOne({ where: { phone: id } });
  }

  async findOneOtpLoginByPhone(phone: string): Promise<OtpDocument> {
    return this.otpRepository.findOne({
      where: {
        phone,
        user_type: 'login',
        // validated: false,
      },
    });
  }

  async findOneOtpLoginByEmail(email: string): Promise<OtpDocument> {
    return this.otpRepository.findOne({
      where: {
        email,
        user_type: 'login',
        validated: false,
      },
    });
  }

  async findOneOtpAdminByEmail(email: string): Promise<OtpDocument> {
    return this.otpRepository.findOne({
      where: {
        email,
        user_type: 'admin',
        validated: false,
      },
    });
  }

  async findOneOtpAdminByPhone(phone: string): Promise<OtpDocument> {
    return this.otpRepository.findOne({
      where: {
        phone,
        user_type: 'admin',
        validated: false,
      },
    });
  }

  async findOneOtpByIdPhone(
    phone: string,
    user_type: string,
  ): Promise<OtpDocument> {
    return this.otpRepository.findOne({
      where: { phone: phone, user_type: user_type },
    });
  }

  async findAppsByPhone(phone: string) {
    const querires = await this.otpRepository
      .createQueryBuilder('ot')
      .select(['ot.apps_id'])
      .where('phone =:phones', { phones: phone })
      .getOne();

    return this.responseService.success(
      true,
      'Getting application data Successfully!.',
      querires,
    );
  }

  async findOneOtpByIdPhoneAndGroup(
    phone: string,
    user_type: string,
    group_id: string = null,
  ): Promise<OtpDocument> {
    if (group_id) {
      return this.otpRepository.findOne({
        where: {
          phone: phone,
          user_type: user_type,
          group_id: group_id,
        },
      });
    }

    return this.otpRepository.findOne({
      where: { phone: phone, user_type: user_type, group_id: null },
    });
  }

  async createOTP(data: Record<string, any>): Promise<OtpDocument> {
    const create_otp: Partial<OtpDocument> = {
      phone: data.phone,
      email: data.email,
      referral_code: data.referral_code,
      otp_code: data.otp_code,
      user_type: data.user_type,
      apps_id: data.apps_id,
      validated: data.validated,
    };
    return this.otpRepository.save(create_otp);
  }

  async updateOTP(data: Record<string, any>): Promise<UpdateResult> {
    const create_otp: Partial<OtpDocument> = {};
    if (
      typeof data.phone != 'undefined' &&
      data.phone != null &&
      data.phone != ''
    )
      create_otp.phone = data.phone;
    if (
      typeof data.referral_code != 'undefined' &&
      data.referral_code != null &&
      data.referral_code != ''
    )
      create_otp.referral_code = data.referral_code;
    if (
      typeof data.otp_code != 'undefined' &&
      data.otp_code != null &&
      data.otp_code != ''
    )
      create_otp.otp_code = data.otp_code;
    if (
      typeof data.user_type != 'undefined' &&
      data.user_type != null &&
      data.user_type != ''
    )
      create_otp.user_type = data.user_type;
    if (isDefined(data.validated)) create_otp.validated = data.validated;
    return this.otpRepository
      .createQueryBuilder('auth_otp')
      .update(OtpDocument)
      .set(create_otp)
      .where('id = :id', { id: data.id_otp })
      .execute();
  }

  async updateFullOtp(data: Partial<OtpDocument>): Promise<OtpDocument> {
    return this.otpRepository.save(data);
  }

  async checkExpirationTime(otptime: Date, exptime: number): Promise<boolean> {
    const skg = new Date().getTime();
    const exp = otptime.getTime();

    if (skg - exp > exptime * 1000) {
      return true;
    }
    return false;
  }

  async updatePhoneOtp(
    args: Partial<AuthOtpLoginValidation>,
  ): Promise<Record<string, any>> {
    const existphone: OtpDocument = await this.otpRepository
      .findOne({
        where: { phone: args.phone },
      })
      .catch(() => {
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.BAD_REQUEST,
            {
              value: args.phone,
              property: 'phone',
              constraint: [this.messageService.get('auth.create.invalidPhone')],
            },
            'Bad Request',
          ),
        );
      });

    const cekNewPhone: OtpDocument = await this.otpRepository
      .findOne({
        where: { phone: args.phone_new },
      })
      .catch(() => {
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.BAD_REQUEST,
            {
              value: args.phone_new,
              property: 'phone',
              constraint: [this.messageService.get('auth.create.invalidPhone')],
            },
            'Bad Request',
          ),
        );
      });
    if (cekNewPhone) {
      if (cekNewPhone.user_type == 'customer') {
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.BAD_REQUEST,
            {
              value: args.phone_new,
              property: 'phone',
              constraint: [this.messageService.get('auth.create.exist')],
            },
            'Bad Request',
          ),
        );
      }
    }

    const url: string = process.env.BASEURL_SMS_SERVICE + '/api/v1/otp/otp';
    const otp = await this.commonService.postHttp(url, {
      phone: args.phone_new,
    });
    existphone.otp_code = otp.data.otp_code;
    existphone.phone = args.phone_new;
    existphone.validated = false;
    await this.otpRepository.save(existphone).catch((err) => {
      console.error('catch error: ', err);
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: '',
            property: err.column,
            constraint: [err.message],
          },
          'Bad Request',
        ),
      );
    });
    const logger = new Logger();
    logger.log(
      'Create OTP for ' + args.phone_new + ' :' + existphone.otp_code,
      'CtrlCreateOTP ',
    );

    if (process.env.NODE_ENV === 'test') {
      return { status: true, otp: existphone.otp_code };
    } else {
      return { status: true };
    }
  }

  async otpPhone(args: Record<string, any>) {
    const logger = new Logger();
    const http_req: Record<string, any> = {
      phone: args.phone,
      name: args.name,
    };
    const url: string = process.env.BASEURL_SMS_SERVICE + '/api/v1/otp/otp';
    const existOtpPhone: OtpDocument = await this.otpRepository.findOne({
      where: { phone: args.phone, user_type: args.user_type },
    });
    if (existOtpPhone) {
      const isexp: boolean = await this.checkExpirationTime(
        existOtpPhone.updated_at,
        Number(process.env.OTP_REG_EXPTIME || 60),
      );
      if (!isexp) {
        const errors: RMessage = {
          value: args.phone,
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

    const result: Record<string, any> = await this.commonService.postHttp(
      url,
      http_req,
    );
    if (result.success) {
      args.otp_code = result.data.otp_code;
      try {
        if (existOtpPhone) {
          if (args.user_type == 'customer_disbursement') {
            existOtpPhone.validated = false;
          }
          existOtpPhone.otp_code = result.data.otp_code;

          await this.otpRepository.save(existOtpPhone);
        } else {
          await this.otpRepository.save(args);
        }
        logger.log(
          'Create OTP for ' + args.phone + ' :' + args.otp_code,
          'CtrlCreateOTP Phone',
        );
        if (process.env.NODE_ENV === 'test') {
          return { status: true, otp: args.otp_code };
        } else {
          return { status: true };
        }
      } catch (err: any) {
        logger.error(err, 'create try catch');
        const errors: RMessage = {
          value: args.phone,
          property: 'phone',
          constraint: [this.messageService.get('auth.create.fail')],
        };
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }
    return result;
  }

  async otpPhoneValidation(args: Record<string, any>) {
    const existOtpPhone: OtpDocument = await this.otpRepository.findOne({
      where: { phone: args.phone, user_type: args.user_type },
    });
    if (!existOtpPhone) {
      const errors: RMessage = {
        value: args.phone,
        property: 'phone',
        constraint: [this.messageService.get('auth.validate.invalid')],
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
    if (args.user_type == 'customer_disbursement') {
      if (existOtpPhone.validated) {
        const errors: RMessage = {
          value: args.otp_code,
          property: 'otp_code',
          constraint: [this.messageService.get('auth.general.dataNotFound')],
        };
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }
    if (existOtpPhone.otp_code != args.otp_code) {
      const errors: RMessage = {
        value: args.otp_code,
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
      existOtpPhone.validated = true;
      this.updateFullOtp(existOtpPhone);

      //Create Token
      // const param_token = {
      //   id: args.id,
      //   user_type: args.user_type,
      //   roles: args.roles,
      // };
      // const accessToken: string = await this.createAccessToken(param_token);
      // const refreshtoken: string = await this.createAccessRefreshToken(
      //   param_token,
      // );
      // const rdata: Record<string, string> = {
      //   token: accessToken,
      //   refreshtoken,
      // };

      return this.responseService.success(
        true,
        this.messageService.get('auth.validate.success'),
        // rdata,
      );
    } catch (err: any) {
      const errors: RMessage = {
        value: args.otp_code,
        property: 'otp_code',
        constraint: [this.messageService.get('auth.validate.invalid_otp')],
      };

      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    }
    // }
  }

  async otpEmail(args: Record<string, any>) {
    const logger = new Logger();
    const http_req: Record<string, any> = {
      email: args.email,
    };
    const url: string = process.env.BASEURL_EMAIL_SERVICE + '/api/v1/email';
    const exist_otp_email: OtpDocument = await this.otpRepository.findOne({
      where: { email: args.email, user_type: args.user_type },
    });
    if (exist_otp_email) {
      const isexp: boolean = await this.checkExpirationTime(
        exist_otp_email.updated_at,
        Number(process.env.OTP_REG_EXPTIME || 60),
      );
      if (!isexp) {
        const errors: RMessage = {
          value: args.email,
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

    const result: Record<string, any> = await this.commonService.postHttp(
      url,
      http_req,
    );
    if (result.success) {
      args.otp_code = result.data.otp_code;
      try {
        if (exist_otp_email) {
          await this.otpRepository.save(exist_otp_email);
        } else {
          await this.otpRepository.save(args);
        }
        logger.log(
          'Create OTP for ' + args.email + ' :' + args.otp_code,
          'CtrlCreateOTP Email',
        );
        if (process.env.NODE_ENV === 'test') {
          return { status: true, otp: args.otp_code };
        } else {
          return { status: true };
        }
      } catch (err: any) {
        logger.error(err, 'create try catch');
        const errors: RMessage = {
          value: args.email,
          property: 'email',
          constraint: [this.messageService.get('auth.create.fail')],
        };
        return this.responseService.error(
          HttpStatus.BAD_REQUEST,
          errors,
          'Bad Request',
        );
      }
    }
    return result;
  }

  async otpEmailValidation(args: Record<string, any>) {
    const exist_otp_email: OtpDocument = await this.otpRepository.findOne({
      where: { email: args.email, user_type: args.user_type },
    });

    if (!exist_otp_email) {
      const errors: RMessage = {
        value: args.email,
        property: 'email',
        constraint: [this.messageService.get('auth.validate.invalid')],
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    } else {
      if (exist_otp_email.otp_code != args.otp_code) {
        const errors: RMessage = {
          value: args.otp_code,
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
        exist_otp_email.validated = true;
        this.updateFullOtp(exist_otp_email);

        //Create Token
        // const param_token = {
        //   id: args.id,
        //   user_type: args.user_type,
        //   roles: args.roles,
        // };
        // const accessToken: string = await this.createAccessToken(param_token);
        // const refreshtoken: string = await this.createAccessRefreshToken(
        //   param_token,
        // );
        // const rdata: Record<string, string> = {
        //   token: accessToken,
        //   refreshtoken,
        // };

        return this.responseService.success(
          true,
          this.messageService.get('auth.validate.success'),
          // rdata,
        );
      } catch (err: any) {
        const errors: RMessage = {
          value: args.otp_code,
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

  async createOtpDisbursement(data: any) {
    const url: string = process.env.BASEURL_OTP_SERVICE + '/api/v1/otp/sms';
    const logger = new Logger();
    const otpData: Record<string, any> = {
      phone: data.phone,
    };
    const exist_otp_phone: OtpDocument = await this.otpRepository.findOne({
      where: { user_type: 'customer_disbursement' },
    });
    try {
      const otp_code = await this.commonService.postHttp(url, otpData);
      otpData.phone = data.phone;
      otpData.otp_code = otp_code.data.otp_code;
      otpData.user_type = 'customer_disbursement';

      if (exist_otp_phone) {
        otpData.id_otp = exist_otp_phone.id;
        await this.updateOTP(otpData);
      } else {
        await this.createOTP(otpData);
      }
      logger.log(
        'Create OTP for ' + otpData.phone + ' :' + otpData.otp_code,
        'CtrlCreateOTP ',
      );

      if (process.env.NODE_ENV === 'test') {
        return { status: true, otp: otpData.otp_code };
      } else {
        return { status: true };
      }
    } catch (err: any) {
      logger.error(err, 'create try catch');
      const errors: RMessage = {
        value: otpData.phone,
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

  async createOtpPhoneProblem(args: Record<string, any>): Promise<any> {
    const data: Partial<OtpDocument> = {};
    const existphone: OtpDocument = await this.findOneOtpByIdPhone(
      args.phone,
      args.user_type,
    );

    if (existphone) {
      if (!existphone.validated) {
        const isexp: boolean = await this.checkExpirationTime(
          existphone.updated_at,
          Number(process.env.OTP_REG_EXPTIME || 60),
        );
        if (!isexp) {
          const errors: RMessage = {
            value: args.phone,
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
      Object.assign(data, existphone);
    }
    data.validated = false;
    data.phone = args.phone;
    data.user_type = args.user_type;
    const logger = new Logger();
    const http_req: Record<string, any> = {
      email: args.email,
      name: args.name,
    };
    const url: string = process.env.BASEURL_EMAIL_SERVICE + '/api/v1/email';
    try {
      const result = await this.commonService.postHttp(url, http_req);
      data.otp_code = result.data.otp_code;
      if (data.id) {
        data.id_otp = data.id;
        await this.updateOTP(data);
      } else {
        await this.createOTP(data);
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
      );
    }
  }

  async validateOtpPhoneProblem(data: Record<string, any>): Promise<any> {
    const existphone: OtpDocument = await this.findOneOtpByIdPhone(
      data.phone,
      data.user_type,
    );

    if (!existphone) {
      const errors: RMessage = {
        value: data.phone,
        property: 'phone',
        constraint: [this.messageService.get('auth.create.invalidValidated')],
      };
      return this.responseService.error(
        HttpStatus.BAD_REQUEST,
        errors,
        'Bad Request',
      );
    } else {
      if (existphone.validated) {
        const errors: RMessage = {
          value: `${existphone.validated}`,
          property: 'validated',
          constraint: [this.messageService.get('auth.validate.invalid_otp')],
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
        this.updateFullOtp(existphone);

        //Create Token
        const param_token = {
          id: data.id,
          user_type: 'customer',
          roles: ['customer'],
        };
        const accessToken: string = await this.createAccessToken(param_token);
        const refreshtoken: string = await this.createAccessRefreshToken(
          param_token,
        );
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

  async createOtpValidatePhoneNew(
    args: Partial<AuthOtpLoginValidation>,
  ): Promise<Record<string, any>> {
    const existphone: OtpDocument = await this.otpRepository
      .findOne({
        where: { phone: args.phone },
      })
      .catch(() => {
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.BAD_REQUEST,
            {
              value: args.phone,
              property: 'phone',
              constraint: [this.messageService.get('auth.create.invalidPhone')],
            },
            'Bad Request',
          ),
        );
      });

    const url: string = process.env.BASEURL_SMS_SERVICE + '/api/v1/sms';
    const otp = await this.commonService.postHttp(url, {
      phone: args.phone_new,
      name: args.name,
    });
    existphone.otp_code = otp.data.otp_code;
    existphone.phone = args.phone;
    existphone.user_type = 'phone-problem-phonenew';
    existphone.validated = false;
    await this.otpRepository.save(existphone).catch((err) => {
      console.error('catch error: ', err);
      throw new BadRequestException(
        this.responseService.error(
          HttpStatus.BAD_REQUEST,
          {
            value: '',
            property: err.column,
            constraint: [err.message],
          },
          'Bad Request',
        ),
      );
    });
    const logger = new Logger();
    logger.log(
      'Create OTP for ' + args.phone + ' :' + existphone.otp_code,
      'CtrlCreateOTP ',
    );

    if (process.env.NODE_ENV === 'test') {
      return { status: true, otp: existphone.otp_code };
    } else {
      return { status: true };
    }
  }

  async validateOtpPhoneProblemPhoneNew(
    args: Record<string, any>,
  ): Promise<any> {
    const existphone: OtpDocument = await this.otpRepository
      .findOne({
        where: { phone: args.phone, user_type: 'phone-problem-phonenew' },
      })
      .catch(() => {
        throw new BadRequestException(
          this.responseService.error(
            HttpStatus.BAD_REQUEST,
            {
              value: args.phone,
              property: 'phone',
              constraint: [this.messageService.get('auth.create.invalidPhone')],
            },
            'Bad Request',
          ),
        );
      });
    if (existphone.otp_code != args.otp_code) {
      const errors: RMessage = {
        value: args.otp_code,
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
      this.updateFullOtp(existphone);

      //Check Existing Login OTP
      const loginPhone: OtpDocument = await this.otpRepository
        .findOne({
          where: { phone: args.phone, user_type: 'login' },
        })
        .catch(() => {
          throw new BadRequestException(
            this.responseService.error(
              HttpStatus.BAD_REQUEST,
              {
                value: args.phone,
                property: 'phone',
                constraint: [
                  this.messageService.get('auth.create.invalidPhone'),
                ],
              },
              'Bad Request',
            ),
          );
        });

      //delete otp login phone new
      await this.otpRepository.softDelete({
        phone: args.phone_new,
        user_type: 'login',
      });

      const newLoginPhone: Partial<OtpDocument> = {
        phone: args.phone_new,
        otp_code: args.otp_code,
        user_type: 'login',
        validated: true,
      };

      if (loginPhone) {
        newLoginPhone.id = loginPhone.id;
      }
      this.updateFullOtp(newLoginPhone);

      //Create Token
      const param_token = {
        id: args.id,
        user_type: 'customer',
        roles: ['customer'],
      };
      const accessToken: string = await this.createAccessToken(param_token);
      const refreshtoken: string = await this.createAccessRefreshToken(
        param_token,
      );
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
        value: args.otp_code,
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
