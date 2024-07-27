import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Department } from './entities/department.entity';
import { In, Repository } from 'typeorm';
import { DepartmentValue } from 'src/interfaces/enums/department.enums';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}
  async create(createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentRepository.save(createDepartmentDto);
  }

  findAll() {
    return `This action returns all department`;
  }

  findOne(id: string) {
    return this.departmentRepository.findOne({ where: { id } });
  }
  async findOneBySlug(hospitalId: string, value: DepartmentValue) {
    return await this.departmentRepository.findOne({
      where: {
        hospital: { id: hospitalId },
        value: value,
      },
    });
  }
  async findMany(hospitalId: string, ids: string[]) {
    return await this.departmentRepository.find({
      where: {
        hospital: { id: hospitalId }, // Ensure we are matching the hospital ID
        value: In(ids),
      },
    });
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(id);
    Object.assign(department, updateDepartmentDto);

    return await this.departmentRepository.save(department);
  }

  remove(id: string) {
    return this.departmentRepository.softDelete(id);
  }
}
