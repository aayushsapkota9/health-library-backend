import { Module } from '@nestjs/common';
import { CustomerBillService } from './customer-bill.service';
import { CustomerBillController } from './customer-bill.controller';

@Module({
  controllers: [CustomerBillController],
  providers: [CustomerBillService],
})
export class CustomerBillModule {}
