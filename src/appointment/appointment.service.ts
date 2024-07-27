import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentService } from 'src/department/department.service';
import { DoctorsService } from 'src/doctors/doctors.service';
import { paginateResponse } from 'src/helpers/pagination';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private departmentService: DepartmentService,
    private doctorService: DoctorsService,
  ) {}
  async create(createAppointmentDto: CreateAppointmentDto) {
    const { department, doctor, hospitalId, ...others } = createAppointmentDto;
    const appointment = this.appointmentRepository.create({
      ...others,
    });
    const doctorInDb = await this.doctorService.findOne(doctor);
    const departmentInDb = await this.departmentService.findOneBySlug(
      hospitalId,
      department,
    );
    appointment.doctor = doctorInDb;
    appointment.department = departmentInDb;

    return await this.appointmentRepository.save(appointment);
  }

  async findAll(query: PaginationDto, user: User) {
    console.log(user);
    const data = await this.appointmentRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
    });
    console.log(data);
    return paginateResponse(data, query);
  }

  findOne(id: string) {
    return this.appointmentRepository.findOne({ where: { id } });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const apppointment = await this.findOne(id);
    Object.assign(apppointment, updateAppointmentDto);
    return this.appointmentRepository.save(apppointment);
  }

  remove(id: string) {
    return this.appointmentRepository.delete(id);
  }
}
