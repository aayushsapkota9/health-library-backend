import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { DepartmentValue } from 'src/interfaces/enums/department.enums';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'The ID of the department',
    example: 'gastroenterology',
  })
  @IsString()
  @IsNotEmpty()
  department: DepartmentValue;

  @ApiProperty({
    description: 'The ID of the hospital',
    example: 'Kantipur',
  })
  @IsString()
  @IsNotEmpty()
  hospitalId: string;

  @ApiProperty({
    description: 'The ID of the doctor',
    example: '1635ce22-f406-4070-9e14-b5649d388d7a',
  })
  @IsUUID()
  @IsNotEmpty()
  doctor: string;

  @ApiProperty({
    description: 'The date of the appointment',
    example: '1976-04-07',
  })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'The full name of the patient',
    example: 'Lydia Barry',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'The phone number of the patient',
    example: 'Fuga Animi ut faci',
  })
  @IsString()
  @IsNotEmpty()
  phoneNo: string;

  @ApiProperty({
    description: 'The condition of the patient',
    example: 'Similique magni aute',
  })
  @IsString()
  @IsNotEmpty()
  condition: string;
}
