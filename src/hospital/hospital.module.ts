import { Module } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Department } from 'src/department/entities/department.entity';
import { DepartmentModule } from 'src/department/department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hospital, Department, Doctor]),
    DepartmentModule,
  ],
  controllers: [HospitalController],
  providers: [HospitalService],
  exports: [HospitalService],
})
export class HospitalModule {}
