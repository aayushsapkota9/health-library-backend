import { Module } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Department } from 'src/department/entities/department.entity';
import { DepartmentModule } from 'src/department/department.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hospital, Department, Staff]),
    DepartmentModule,
    UserModule,
  ],
  controllers: [HospitalController],
  providers: [HospitalService],
  exports: [HospitalService],
})
export class HospitalModule {}
