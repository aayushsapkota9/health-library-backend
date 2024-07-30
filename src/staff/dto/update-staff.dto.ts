import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateStaffDto } from './create-staff.dto';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @ApiProperty({
    description: 'The password for the user account',
    example: 'StrongPassword123',
  })
  @IsOptional()
  @IsString()
  password: string;
}
