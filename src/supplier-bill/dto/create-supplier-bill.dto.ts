import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  ValidateNested,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { UUID } from 'crypto';
import { Product } from 'src/product/entities/product.entity';

export class CreateSupplierBillDto {
  @IsString()
  billNo: string;

  @IsString()
  billDate: string;

  @IsString()
  @IsUUID()
  supplier: UUID;

  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  @ValidateNested({ each: true })
  products: Product[];
}
