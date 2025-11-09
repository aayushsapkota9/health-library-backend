import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVitalsDto {
  @ApiProperty({
    description: 'Body temperature in Celsius',
    example: 37.2,
    minimum: 30,
    maximum: 45,
  })
  @IsNumber()
  @Min(30)
  @Max(45)
  temperature: number;

  @ApiProperty({
    description: 'Systolic blood pressure',
    example: 120,
  })
  @IsNumber()
  systolic: number;

  @ApiProperty({
    description: 'Diastolic blood pressure',
    example: 80,
  })
  @IsNumber()
  diastolic: number;

  @ApiProperty({
    description: 'Heart rate in beats per minute',
    example: 75,
    minimum: 30,
    maximum: 300,
  })
  @IsNumber()
  @Min(30)
  @Max(300)
  heartRate: number;

  @ApiProperty({
    description: 'Blood oxygen level percentage',
    example: 98,
    minimum: 50,
    maximum: 100,
  })
  @IsNumber()
  @Min(50)
  @Max(100)
  bloodOxygen: number;
}
