import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HeightUnits } from 'src/enums/height-unit.enums';

export class CreateRecordDto {
  @ApiProperty({
    description: 'The ID of the patient',
    example: '12345',
  })
  @IsNotEmpty()
  @IsString()
  patient: string;

  @ApiProperty({
    description: 'The weight of the patient in kilograms',
    example: 70,
  })
  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @ApiProperty({
    description: 'The height of the patient',
    example: 175,
  })
  @IsNotEmpty()
  @IsNumber()
  height: number;

  @ApiProperty({
    description: 'The unit of measurement for height',
    enum: HeightUnits,
    example: HeightUnits.CM,
  })
  @IsNotEmpty()
  @IsEnum(HeightUnits)
  heightUnit: HeightUnits;

  @ApiProperty({
    description: 'A list of symptoms the patient is experiencing',
    example: ['cough', 'fever'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  symptoms: string[];

  @ApiProperty({
    description: "Additional remarks about the patient's condition",
    example: 'Patient is experiencing mild symptoms.',
  })
  @IsString()
  remarks: string;
}
