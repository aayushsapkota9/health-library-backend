import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Gender } from 'src/auth/enums/gender.enum';

export class CreatePatientDto {
  @ApiProperty({ description: 'The name of the patient' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The phone number of the patient' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'The date of birth of the patient',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({ description: 'The gender of the patient', enum: Gender })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ description: 'The email of the patient' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the patient account',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
