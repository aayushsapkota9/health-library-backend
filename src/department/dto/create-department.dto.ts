import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DepartmentValue } from 'src/interfaces/enums/department.enums';

export class CreateDepartmentDto {
  @ApiProperty({
    example: DepartmentValue.Cardiology,
  })
  @IsEnum(DepartmentValue)
  value: DepartmentValue;
}
