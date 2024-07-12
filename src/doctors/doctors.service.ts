import { Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    private userService: UserService,
  ) {}
  async create(
    createDoctorDto: CreateDoctorDto,
    files: {
      documentFront?: Express.Multer.File[];
      documentBack?: Express.Multer.File[];
    },
  ) {
    const { fullName, email, password, ...others } = createDoctorDto;
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
    return this.doctorRepository.save(doctor);
  }

  findAll() {
    return `This action returns all doctors`;
  }

  findOne(id: number) {
    return `This action returns a #${id} doctor`;
  }

  update(id: number, updateDoctorDto: UpdateDoctorDto) {
    console.log(updateDoctorDto);
    return `This action updates a #${id} doctor`;
  }

  remove(id: number) {
    return `This action removes a #${id} doctor`;
  }
}
