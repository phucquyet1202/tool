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
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống';
    let error: object | null = null;

    // 👉 Ghi log lỗi để debug
    console.error('🔥 Lỗi hệ thống:', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        message = (res as any)?.message || message;
        error = res;
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
