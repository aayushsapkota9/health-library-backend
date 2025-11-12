// vitals.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVitalsDto } from './dto/create-vitals.dto';
import { BloodOxygen } from './entities/blood-oxygen.entity';
import { BloodPressure } from './entities/blood-pressure.entity';
import { HeartRate } from './entities/heart-rate.entity';
import { Record } from './entities/record.entity';
import { BodyTemperature } from './entities/temperature.entity';

@Injectable()
export class VitalsService {
  constructor(
    @InjectRepository(BodyTemperature)
    private readonly tempRepository: Repository<BodyTemperature>,

    @InjectRepository(HeartRate)
    private readonly heartRateRepository: Repository<HeartRate>,

    @InjectRepository(BloodPressure)
    private readonly bpRepository: Repository<BloodPressure>,

    @InjectRepository(BloodOxygen)
    private readonly boRepository: Repository<BloodOxygen>,

    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
  ) {}

  // ----------------------
  // CREATE VITALS FOR A RECORD
  // ----------------------
  async create(recordId: string, createVitalsDto: CreateVitalsDto) {
    const record = await this.recordRepository.findOne({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    const { temperature, heartRate, systolic, diastolic, bloodOxygen } =
      createVitalsDto;

    // Body Temperature
    if (temperature) {
      const temp = this.tempRepository.create({
        value: temperature,
        record,
      });
      await this.tempRepository.save(temp);
    }

    // Heart Rate
    if (heartRate) {
      const hr = this.heartRateRepository.create({
        value: heartRate,
        record,
      });
      await this.heartRateRepository.save(hr);
    }

    // Blood Pressure
    if (systolic && diastolic) {
      const bp = this.bpRepository.create({
        systolic,
        diastolic,
        record,
      });
      await this.bpRepository.save(bp);
    }

    // Blood Oxygen
    if (bloodOxygen) {
      const bo = this.boRepository.create({
        value: bloodOxygen,
        record,
      });
      await this.boRepository.save(bo);
    }

    return record;
  }

  // ----------------------
  // GET ALL VITALS FOR A RECORD
  // ----------------------
  async getVitals(recordId: string) {
    const record = await this.recordRepository.findOne({
      where: { id: recordId },
      relations: [
        'bodyTemperature',
        'heartRate',
        'bloodPressure',
        'bloodOxygen',
      ],
    });
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    return {
      bodyTemperature: record.bodyTemperature,
      heartRate: record.heartRate,
      bloodPressure: record.bloodPressure,
      bloodOxygen: record.bloodOxygen,
    };
  }

  // ----------------------
  // UPDATE A VITAL ENTRY
  // ----------------------
  async updateVital(vitalType: string, vitalId: string, value: any) {
    let repository: Repository<any>;

    switch (vitalType) {
      case 'temperature':
        repository = this.tempRepository;
        break;
      case 'heartRate':
        repository = this.heartRateRepository;
        break;
      case 'bloodPressure':
        repository = this.bpRepository;
        break;
      case 'bloodOxygen':
        repository = this.boRepository;
        break;
      default:
        throw new BadRequestException('Invalid vital type');
    }

    const vital = await repository.findOne({ where: { id: vitalId } });
    if (!vital) throw new NotFoundException('Vital not found');

    Object.assign(vital, value);
    return repository.save(vital);
  }

  // ----------------------
  // DELETE A VITAL ENTRY
  // ----------------------
  async deleteVital(vitalType: string, vitalId: string) {
    let repository: Repository<any>;

    switch (vitalType) {
      case 'temperature':
        repository = this.tempRepository;
        break;
      case 'heartRate':
        repository = this.heartRateRepository;
        break;
      case 'bloodPressure':
        repository = this.bpRepository;
        break;
      case 'bloodOxygen':
        repository = this.boRepository;
        break;
      default:
        throw new BadRequestException('Invalid vital type');
    }

    const vital = await repository.findOne({ where: { id: vitalId } });
    if (!vital) throw new NotFoundException('Vital not found');

    return repository.remove(vital);
  }
}
