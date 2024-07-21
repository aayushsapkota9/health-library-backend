import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDiseaseDto {
  @ApiProperty({
    description: 'Html output by editor',
    example: '<h1>Hello World</h1>',
  })
  @IsString()
  @IsNotEmpty()
  html: string;

  @ApiProperty({
    description: 'Name of the disease',
    example: 'Covid-19',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'References of the disease',
    example: 'eg. https://www.who.int/emergencies/diseases',
  })
  @IsString()
  @IsNotEmpty()
  references: string;
}
