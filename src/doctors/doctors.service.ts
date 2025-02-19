import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/auth/enums/role.enum';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { paginateResponse } from 'src/helpers/pagination';
import { ErrorMessage } from 'src/interfaces/common.interface';
import { HospitalService } from 'src/hospital/hospital.service';
import { DepartmentService } from 'src/department/department.service';
import { DepartmentValue } from 'src/interfaces/enums/department.enums';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    private userService: UserService,
    private hospitalService: HospitalService,
    private departmentService: DepartmentService,
    private dataSource: DataSource,
  ) {}
  async create(
    createDoctorDto: CreateDoctorDto,
    files: {
      documentFront?: Express.Multer.File[];
      documentBack?: Express.Multer.File[];
    },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { fullName, email, password, hospital, departments, ...others } =
        createDoctorDto;
      const user = await this.userService.addUser({
        fullName,
        email,
        password,
        roles: [Role.User],
      });
      const doctor = this.doctorRepository.create({
        ...others,
        documentFront: files.documentFront[0].path,
        documentBack: files.documentBack[0].path,
      });
      doctor.user = user;
      const hospitalInDb = await this.hospitalService.findOne(hospital);
      doctor.hospital = hospitalInDb;
      const departmentsInDb = await this.departmentService.findMany(
        hospital,
        departments,
      );
      doctor.departments = departmentsInDb;
      const savedDoctor = await this.doctorRepository.save(doctor);
      return savedDoctor;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PaginationDto) {
    const data = await this.doctorRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      relations: ['user'],
    });
    return paginateResponse(data, query);
  }

  async findOne(id: string) {
    return await this.doctorRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findOneByEmail(email: string) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { email } },
      relations: ['user'],
    });
    if (!doctor) {
      throw new NotFoundException(ErrorMessage.NOT_FOUND, 'Doctor');
    }
    return doctor;
  }

  async update(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
    files: {
      documentFront?: Express.Multer.File[];
      documentBack?: Express.Multer.File[];
    },
  ) {
    const { fullName, email, password, ...others } = updateDoctorDto;
    const doctor = await this.findOne(id);
    if (doctor.user.email !== email) {
      throw new BadRequestException('Email cannot be changed');
    }
    if (files.documentFront && files.documentFront[0].path) {
      doctor.documentFront = files.documentFront[0].path;
    }
    if (files.documentBack && files.documentBack[0].path) {
      doctor.documentBack = files.documentBack[0].path;
    }
    Object.assign(doctor, others);
    const user = await this.userService.updateUser(
      {
        fullName,
        email,
        password,
      },
      doctor.user.id,
    );
    doctor.user = user;
    return this.doctorRepository.save(doctor);
  }

  async remove(id: string) {
    const doctor = await this.findOne(id);
    return this.doctorRepository.remove(doctor);
  }

  async findByHospitalAndDepartment(
    hospital: string,
    department: DepartmentValue,
  ) {
    return await this.doctorRepository.find({
      where: {
        hospital: { id: hospital },
        departments: { value: department },
      },
    });
  }
}
