import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierBillDto } from './dto/create-supplier-bill.dto';
import { UpdateSupplierBillDto } from './dto/update-supplier-bill.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { SupplierBill } from './entities/supplier-bill.entity';
import { ProductService } from 'src/product/product.service';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { UUID } from 'crypto';

@Injectable()
export class SupplierBillService {
  constructor(
    @InjectRepository(SupplierBill)
    private supplierBillRepository: Repository<SupplierBill>,
    private productService: ProductService,
  ) {}
  async create(createSupplierBillDto: CreateSupplierBillDto) {
    try {
      const supplierBill = plainToClass(Supplier, createSupplierBillDto);
      await Promise.all(
        createSupplierBillDto.products.map(async (item, index) => {
          if (item.id) {
            const product = plainToClass(UpdateProductDto, item);

            const createdProduct = await this.productService.createAndUpdate(
              item.id,
              product,
            );
            supplierBill.products[index] = createdProduct;
          } else {
            const product = plainToClass(CreateProductDto, item);
            const createdProduct = await this.productService.create(product);
            supplierBill.products[index] = createdProduct;
          }
        }),
      );

      return await this.supplierBillRepository.save(supplierBill);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.supplierBillRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: UUID): Promise<SupplierBill> {
    try {
      const supplier = await this.supplierBillRepository.findOne({
        where: { id },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier Bill not found.');
      } else {
        return supplier;
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id: UUID, updateSupplierBillDto: UpdateSupplierBillDto) {
    try {
      const supplierBill = plainToClass(SupplierBill, updateSupplierBillDto);
      return await this.supplierBillRepository.update(id, supplierBill);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.supplierBillRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
