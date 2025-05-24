import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { sendResponse } from '../sendRespone/response.helper';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống';
    // 👉 Ghi log lỗi để debug
    console.error('🔥 Lỗi hệ thống:', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        if (typeof resObj.message === 'string') {
          message = resObj.message;
        }
      }
    }

    const resBody = sendResponse({
      statusCode: status,
      message,
      data: null,
      error:
        exception instanceof HttpException
          ? exception.name
          : 'InternalServerError',
    });

    response.status(status).json(resBody);
  }
}
