import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  page: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  limit: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Field to sort by', example: 'name' })
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search term', example: 'John' })
  query?: string;
}
