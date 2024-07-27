import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { successResponse } from 'src/interfaces/successResponse.interface';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Response<T>>> {
    const message =
      this.reflector.get<string>('message', context.getHandler()) ||
      'Default Success Message';
    const source =
      this.reflector.get<string>('source', context.getHandler()) ||
      'default-source';

    return next.handle().pipe(
      map((data) => {
        const success: successResponse = {
          success: true,
          source: source,
          data: data,
          message: message.replace('%s', source),
          status: 200,
        };
        return success;
      }),
    );
  }
}
