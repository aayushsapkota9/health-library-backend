import { Module } from '@nestjs/common';
import { SupplierBillService } from './supplier-bill.service';
import { SupplierBillController } from './supplier-bill.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierBill } from './entities/supplier-bill.entity';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierBill]), ProductModule],
  controllers: [SupplierBillController],
  providers: [SupplierBillService], // Assuming ProductService is provided in this module
})
export class SupplierBillModule {}
