import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      statusCode: status,
      message:
        ` ${exception
          .getResponse()
          ['message'].replace('%s', exception.getResponse()['error'])}` || null,
      error: exception.getResponse()['error'] || null,
    });
  }
}
