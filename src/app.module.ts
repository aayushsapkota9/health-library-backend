import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { CustomerBillModule } from './customer-bill/customer-bill.module';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DoctorsModule } from './doctors/doctors.module';
import { BlogModule } from './blog/blog.module';
import { User } from './user/entities/user.entity';
import { TypeOrmConfig } from './db/dbconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmConfig),
    UserModule,
    AuthModule,
    DoctorsModule,
    BlogModule,
    // CustomerBillModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
