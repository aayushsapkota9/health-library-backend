import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { Repository } from 'typeorm';
import { PatientsService } from 'src/patients/patients.service';
import { paginateResponse } from 'src/helpers/pagination';
import { PaginationDto } from 'src/helpers/pagination.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
    private readonly patientService: PatientsService,
  ) {}
  async create(createRecordDto: CreateRecordDto) {
    const { patient, ...others } = createRecordDto;
    const patientInDb = await this.patientService.findOne(patient);
    if (!patientInDb) {
      throw new BadRequestException('Patient does not exits in database');
    }

    const record = this.recordRepository.create({
      ...others,
    });
    record.patient = patientInDb;

    return this.recordRepository.save(record);
  }

  async findAll(query: PaginationDto) {
    const data = await this.recordRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      relations: ['patient'],
    });
    return paginateResponse(data, query);
  }

  findOne(id: string) {
    return this.recordRepository.findOne({ where: { id } });
  }

  async update(id: string, updateRecordDto: UpdateRecordDto) {
    const { patient, ...others } = updateRecordDto;
    const patientInDb = await this.patientService.findOne(patient);
    if (!patientInDb) {
      throw new BadRequestException('Patient does not exits in database');
    }
    const record = await this.findOne(id);
    Object.assign(record, others);
    record.patient = patientInDb;
    return this.recordRepository.save(record);
  }

  remove(id: string) {
    return this.recordRepository.softRemove({ id });
  }
}
