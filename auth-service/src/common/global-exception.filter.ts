import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Lỗi NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }
    // Lỗi Axios
    else if (exception.response && exception.response.status) {
      status = exception.response.status;
      message =
        exception.response.data?.message || exception.response.statusText;
    }
    else if (exception.code === 'ECONNABORTED') {
      status = 503;
      message = 'Request timed out';
    } 
    else if (exception.code === 'ENOTFOUND' || exception.code === 'ECONNREFUSED') {
      status = 503;
      message = 'Service unavailable';
    } 
    // Lỗi từ code khác
    else if (exception.message) {
      message = exception.message;
    }

    res.status(status).json({
      statusCode: status,
      message,
    });
  }
}