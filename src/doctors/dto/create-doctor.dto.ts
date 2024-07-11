import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsNumber } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

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
    description: 'The address of the user',
    example: '123 Main St, Anytown USA',
  })
  @IsString()
  fullAddress: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '1234567890',
  })
  @IsNumber()
  phone_no: number;

  @ApiProperty({
    description: 'The organization of the user',
    example: 'Acme Corp',
  })
  @IsString()
  @IsNotEmpty()
  organization: string;
}
