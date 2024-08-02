import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { BloodOxygen } from './entities/blood-oxygen.entity';
import { BloodPressure } from './entities/blood-pressure.entity';
import { HeartRate } from './entities/heart-rate.entity';
import { BodyTemperature } from './entities/temperature.entity';
import { PatientsModule } from 'src/patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Record,
      BloodOxygen,
      BloodPressure,
      HeartRate,
      BodyTemperature,
    ]),
    PatientsModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
