import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/auth/enums/role.enum';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { paginateResponse } from 'src/helpers/pagination';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly userService: UserService,
  ) {}
  async create(createPatientDto: CreatePatientDto) {
    const patient = this.patientRepository.create(createPatientDto);
    const user = await this.userService.addUser({
      name: createPatientDto.name,
      email: createPatientDto.email,
      password: createPatientDto.password,
      role: Role.PATIENT,
    });
    patient.user = user;
    return this.patientRepository.save(patient);
  }

  async findAll(query: PaginationDto) {
    const data = await this.patientRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      relations: ['user'],
    });
    return paginateResponse(data, query);
  }

  findOne(id: string) {
    return this.patientRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  remove(id: string) {
    return this.patientRepository.softRemove({ id });
  }
}
