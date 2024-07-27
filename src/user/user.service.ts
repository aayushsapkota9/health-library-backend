import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { ErrorMessage } from 'src/interfaces/common.interface';
import { CreateUserDTO } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

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
  async findUserById(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(ErrorMessage.NOT_FOUND, 'User');
    }
    return user;
  }
  async updateUser(updateUserDto: UpdateUserDto, id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, ...others } = updateUserDto;

    const user = await this.findUserById(id);
    Object.assign(user, others);
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    return this.userRepository.save(user);
  }
}
