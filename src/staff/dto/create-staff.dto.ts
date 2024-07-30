import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { POSITION } from 'src/auth/enums/position.enum';

export class CreateStaffDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({
    description: 'The phone number of the user',
    example: '1234567890',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'The position',
    example: POSITION.DOCTOR,
  })
  @IsEnum(POSITION)
  position: POSITION;

  @ApiProperty({
    example: ['id1', 'id2'],
  })
  @IsString({ each: true })
  departments: string[];
}
