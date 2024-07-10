import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierBillDto } from './create-supplier-bill.dto';

export class UpdateSupplierBillDto extends PartialType(CreateSupplierBillDto) {}
