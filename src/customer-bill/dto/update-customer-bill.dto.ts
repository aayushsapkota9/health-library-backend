import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerBillDto } from './create-customer-bill.dto';

export class UpdateCustomerBillDto extends PartialType(CreateCustomerBillDto) {}
