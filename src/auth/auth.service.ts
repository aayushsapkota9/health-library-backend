import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt'; // 1
import { CreateUserDTO } from 'src/user/dto/create-user-dto';
import { Role } from './enums/role.enum';
import { HospitalService } from 'src/hospital/hospital.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hospitalService: HospitalService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findUserWithPassword(username);
    console.log(user);
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }
  async login(req: any) {
    const user = await this.userService.findUserWithPassword(req.email);
    const payload = {
      name: user.name,
      email: user.email,
      id: user.id,
      role: user.role,
    };
    console.log(payload);
    return {
      token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async register(createUserDTO: CreateUserDTO) {
    const user = await this.userService.addUser(createUserDTO);
    const payload = {
      name: user.name,
      email: user.email,
      id: user.id,
      roles: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async getUserInfo(id: string) {
    const user = await this.userService.findUserById(id);
    if (user.role === Role.ADMIN) {
      const hospital = await this.hospitalService.findHospitalByUser(id);
      return {
        ...hospital,
        ...user,
        id: user.id,
        hospitalId: hospital.id,
      };
    }
    if (user.role === Role.STAFF) {
      return user;
    }
  }
}
