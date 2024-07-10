import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsUUID() // Ensure it's a valid UUID
  supplier?: UUID;
}
