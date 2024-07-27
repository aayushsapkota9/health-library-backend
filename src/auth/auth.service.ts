import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt'; // 1
import { CreateUserDTO } from 'src/user/dto/create-user-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findUser(username);
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }
  async login(req: any) {
    const user = await this.userService.findUser(req.email);

    const payload = {
      name: user.fullName,
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDTO: CreateUserDTO) {
    const user = await this.userService.addUser(createUserDTO);
    const payload = {
      name: user.fullName,
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
