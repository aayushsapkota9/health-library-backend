import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';
import { DepartmentValue } from 'src/interfaces/enums/department.enums';

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
  noOfGeneralBeds: number;

  @ApiProperty({ example: 10 })
  @IsNumberString()
  noOfICUBeds: number;

  @ApiProperty({ example: 5 })
  @IsNumberString()
  noOfEmergencyBeds: number;

  @ApiProperty({ example: '12.345678', required: false })
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiProperty({ example: '98.765432', required: false })
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiProperty({
    example: [DepartmentValue.Cardiology, DepartmentValue.Neurology],
  })
  @IsEnum(DepartmentValue, { each: true })
  departments: DepartmentValue[];
}
