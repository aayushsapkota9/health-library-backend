import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { UserModule } from 'src/user/user.module';
import { Department } from 'src/department/entities/department.entity';
import { HospitalModule } from 'src/hospital/hospital.module';
import { DepartmentModule } from 'src/department/department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Department]),
    UserModule,
    HospitalModule,
    DepartmentModule,
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
