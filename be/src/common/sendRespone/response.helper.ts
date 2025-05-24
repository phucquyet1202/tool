import { HttpException } from '@nestjs/common';

export interface SendResponseOptions<T = any> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: any;
  exception?: any;
}

export const sendResponse = <T = any>(options: SendResponseOptions<T>) => {
  // Nếu có exception truyền vào
  if (options.exception instanceof HttpException) {
    const status = options.exception.getStatus();
    const response = options.exception.getResponse() as
      | string
      | { message?: string };

    return {
      statusCode: status,
      message:
        typeof response === 'string'
          ? response
          : typeof response === 'object' &&
              response !== null &&
              'message' in response &&
              typeof response.message === 'string'
            ? response.message
            : 'Lỗi hệ thống',
      data: null,
      error: response,
    };
  }

  // Trường hợp không có exception, trả về dữ liệu thông thường
  return {
    statusCode: options.statusCode ?? 200,
    message: options.message ?? 'Success',
    data: options.data ?? null,
    error: (options.error ?? null) as unknown,
  };
};
