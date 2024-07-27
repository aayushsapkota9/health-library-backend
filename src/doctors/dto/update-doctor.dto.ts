import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateDoctorDto } from './create-doctor.dto';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @ApiProperty({
    description: 'The password for the user account',
    example: 'StrongPassword123',
  })
  @IsOptional()
  @IsString()
  password: string;
}
