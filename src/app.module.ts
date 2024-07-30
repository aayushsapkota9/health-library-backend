import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { CustomerBillModule } from './customer-bill/customer-bill.module';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmConfig } from './db/dbconfig';
import { MulterModule } from '@nestjs/platform-express';
import { DiseasesModule } from './diseases/diseases.module';
import { SearchModule } from './search/search.module';
import { HospitalModule } from './hospital/hospital.module';
import { DepartmentModule } from './department/department.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StaffModule } from './staff/staff.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(TypeOrmConfig),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './upload',
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'upload'),
      serveRoot: '/upload',
    }),
    UserModule,
    AuthModule,
    StaffModule,
    DiseasesModule,
    SearchModule,
    HospitalModule,
    DepartmentModule,
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
