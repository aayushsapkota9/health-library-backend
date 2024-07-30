import { Injectable } from '@nestjs/common';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { DepartmentService } from 'src/department/department.service';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { paginateResponse } from 'src/helpers/pagination';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
    private readonly departmentService: DepartmentService,
    private readonly userService: UserService,
  ) {}
  async create(
    createHospitalDto: CreateHospitalDto,
    files: {
      logo: Express.Multer.File[];
    },
  ) {
    const { departments, ...others } = createHospitalDto;
    const hospital = this.hospitalRepository.create(others);
    hospital.logo = files.logo[0].path;
    const user = await this.userService.addUser({
      name: createHospitalDto.name,
      email: createHospitalDto.email,
      password: createHospitalDto.password,
      role: Role.ADMIN,
    });
    hospital.user = user;
    const dbDepartments = await Promise.all(
      departments.map((item) => {
        return this.departmentService.create({ value: item });
      }),
    );
    hospital.departments = dbDepartments;
    return this.hospitalRepository.save(hospital);
  }

  async findAll(query: PaginationDto) {
    const data = await this.hospitalRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      relations: ['user'],
    });
    return paginateResponse(data, query);
  }

  findOne(id: string) {
    return this.hospitalRepository.findOne({
      where: { id },
      relations: ['departments', 'user'],
    });
  }
  findHospitalByUser(id: string) {
    return this.hospitalRepository.findOne({
      where: { user: { id } },
      relations: ['departments', 'user'],
    });
  }

  async update(
    id: string,
    updateHospitalDto: UpdateHospitalDto,
    files: {
      logo?: Express.Multer.File[];
    },
  ) {
    const { departments, ...others } = updateHospitalDto; // eslint-disable-line @typescript-eslint/no-unused-vars
    const hospital = await this.hospitalRepository.findOne({ where: { id } });
    if (files.logo) {
      hospital.logo = files.logo[0].path;
    }
    Object.assign(hospital, others);
    return this.hospitalRepository.save(hospital);
  }

  remove(id: string) {
    return this.hospitalRepository.softRemove({ id });
  }
}
