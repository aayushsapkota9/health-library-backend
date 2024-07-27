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

    const exceptionResponse = exception.getResponse();
    let message = 'An error occurred';
    let error = null;
    let errorFields = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      message = exceptionResponse['message'] || message;
      error = exceptionResponse['error'] || error;
      // Check if the message is an array (indicating validation errors)
      if (Array.isArray(exceptionResponse['message'])) {
        errorFields = exceptionResponse['message'].map((msg) => {
          const [field, ...rest] = msg.split(' ');
          return {
            field,
            message: rest.join(' '),
          };
        });
        // Set message to null as we are using errorFields instead
        message = 'Validation failed';
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      errorFields,
    });
  }
}
