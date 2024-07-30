import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsEmail,
} from 'class-validator';
import { DepartmentValue } from 'src/enums/department.enums';

export class CreateHospitalDto {
  @ApiProperty({ example: 'City Hospital' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Main St, Anytown' })
  @IsString()
  address: string;

  @ApiProperty({ example: 50 })
  @IsNumberString()
  noOfBeds: number;

  @ApiProperty({ example: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: [DepartmentValue.Cardiology, DepartmentValue.Neurology],
  })
  @IsEnum(DepartmentValue, { each: true })
  departments: DepartmentValue[];
}
