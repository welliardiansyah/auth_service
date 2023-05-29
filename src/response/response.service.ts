import { Injectable } from '@nestjs/common';
import {
  IResponseError,
  IResponsePaging,
  RMessage,
  RSuccessMessage,
} from './response.interface';

@Injectable()
export class ResponseService {
  error(statusCode: number, message: RMessage, errors: string): IResponseError {
    if (errors) {
      return {
        statusCode: statusCode,
        message: [message],
        error: errors,
      };
    }

    return {
      statusCode: statusCode,
      message: [message],
    };
  }

  success(
    success: boolean,
    message: string,
    data?: Record<string, any> | Record<string, any>[],
  ): RSuccessMessage {
    if (data) {
      return {
        success: true,
        message: message,
        data: data,
      };
    }

    return {
      success: true,
      message: message,
    };
  }

  paging(
    message: string,
    totalData: number,
    totalPage: number,
    currentPage: number,
    perPage: number,
    data: Record<string, any>[],
  ): IResponsePaging {
    return {
      message,
      totalData,
      totalPage,
      currentPage,
      perPage,
      data,
    };
  }
}
