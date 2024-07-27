import { Injectable } from '@nestjs/common';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { DepartmentService } from 'src/department/department.service';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { paginateResponse } from 'src/helpers/pagination';

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
    private readonly departmentService: DepartmentService,
  ) {}
  async create(
    createHospitalDto: CreateHospitalDto,
    files: {
      image?: Express.Multer.File[];
      backgroundImage?: Express.Multer.File[];
    },
  ) {
    const { departments, ...others } = createHospitalDto;
    const hospital = this.hospitalRepository.create(others);
    hospital.backgroundImage = files.backgroundImage[0].path;
    hospital.image = files.image[0].path;
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
    });
    return paginateResponse(data, query);
  }

  findOne(id: string) {
    return this.hospitalRepository.findOne({
      where: { id },
      relations: ['departments'],
    });
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto) {
    const { departments, ...others } = updateHospitalDto;
    console.log(departments);
    const hospital = await this.hospitalRepository.findOne({ where: { id } });
    Object.assign(hospital, others);
    return this.hospitalRepository.save(hospital);
  }

  remove(id: string) {
    return this.hospitalRepository.delete({ id });
  }
}
