import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { UserModule } from 'src/user/user.module';
import { Department } from 'src/department/entities/department.entity';
import { HospitalModule } from 'src/hospital/hospital.module';
import { DepartmentModule } from 'src/department/department.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, Department]),
    UserModule,
    HospitalModule,
    DepartmentModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
