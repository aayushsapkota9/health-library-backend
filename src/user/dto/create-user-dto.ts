import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/auth/enums/role.enum';

export class CreateUserDTO {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'Admin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The roles assigned to the user',
    example: [Role.PATIENT],
  })
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'Password@123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
export class LoginUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'StrongPassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
