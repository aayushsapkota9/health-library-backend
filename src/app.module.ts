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
import { TypeOrmConfig } from './db/dbconfig';
import { MulterModule } from '@nestjs/platform-express';
import { DiseasesModule } from './diseases/diseases.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmConfig),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './upload',
      }),
    }),
    UserModule,
    AuthModule,
    DoctorsModule,
    DiseasesModule,
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
