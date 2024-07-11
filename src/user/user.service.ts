import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { ErrorMessage } from 'src/interfaces/common.interface';
import { CreateUserDTO } from './dto/create-user-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async addUser(createUserDTO: CreateUserDTO): Promise<User> {
    const newUser = plainToClass(User, createUserDTO);
    newUser.password = await bcrypt.hash(newUser.password, 10);
    return this.userRepository.save(newUser);
  }
  async findUser(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(ErrorMessage.NOT_FOUND, 'User');
    }
    return user;
  }
}
