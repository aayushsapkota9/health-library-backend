import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { UserService } from 'src/user/user.service';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { paginateResponse } from 'src/helpers/pagination';
import { ErrorMessage } from 'src/interfaces/common.interface';
import { HospitalService } from 'src/hospital/hospital.service';
import { DepartmentService } from 'src/department/department.service';
import { Role } from 'src/auth/enums/role.enum';
import { DepartmentValue } from 'src/enums/department.enums';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private staffRepository: Repository<Staff>,
    private userService: UserService,
    private hospitalService: HospitalService,
    private departmentService: DepartmentService,
    private dataSource: DataSource,
  ) {}
  async create(
    createStaffDto: CreateStaffDto,
    files: {
      photo: Express.Multer.File[];
    },
  ) {
    const { name, email, password, departments, ...others } = createStaffDto;
    const user = await this.userService.addUser({
      name,
      email,
      password,
      role: Role.STAFF,
    });
    const staff = this.staffRepository.create({
      ...others,
      name,
      photo: files.photo[0].path,
    });
    staff.user = user;
    const departmentsInDb = await this.departmentService.findMany(departments);
    staff.departments = departmentsInDb;
    const savedStaff = await this.staffRepository.save(staff);
    return savedStaff;
  }

  async findAll(query: PaginationDto) {
    const data = await this.staffRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      relations: ['user', 'departments'],
    });
    return paginateResponse(data, query);
  }

  async findOne(id: string) {
    return await this.staffRepository.findOne({
      where: { id },
      relations: ['user', 'departments'],
    });
  }

  async findOneByEmail(email: string) {
    const staff = await this.staffRepository.findOne({
      where: { user: { email } },
      relations: ['user'],
    });
    if (!staff) {
      throw new NotFoundException(ErrorMessage.NOT_FOUND, 'Staff');
    }
    return staff;
  }
  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
    files: {
      photo?: Express.Multer.File[];
    },
  ) {
    const { name, email, password, ...others } = updateStaffDto;
    const staff = await this.findOne(id);
    if (staff.user.email !== email) {
      throw new BadRequestException('Email cannot be changed');
    }
    if (files.photo && files.photo[0].path) {
      staff.photo = files.photo[0].path;
    }
    Object.assign(staff, others);
    const user = await this.userService.updateUser(
      {
        name,
        email,
        password,
      },
      staff.user.id,
    );
    staff.user = user;
    return this.staffRepository.save(staff);
  }

  async remove(id: string) {
    const staff = await this.findOne(id);
    return this.staffRepository.remove(staff);
  }

  async findByHospitalAndDepartment(
    hospital: string,
    department: DepartmentValue,
  ) {
    return await this.staffRepository.find({
      where: {
        departments: { value: department },
      },
    });
  }
}
