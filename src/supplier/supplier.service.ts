import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { UUID } from 'crypto';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { paginateResponse } from 'src/helpers/pagination';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    try {
      const payload = plainToClass(Supplier, createSupplierDto);
      return await this.supplierRepository.save(payload);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: PaginationDto) {
    const skip = (query.page - 1) * query.limit;

    try {
      const { sortBy, sortOrder } = query;

      const [data, total] = await this.supplierRepository.findAndCount({
        take: query.limit,
        skip,
        order: sortBy ? { [sortBy]: sortOrder || 'ASC' } : undefined,
      });

      return { data, total };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: UUID): Promise<Supplier> {
    try {
      const supplier = await this.supplierRepository.findOne({ where: { id } });
      if (!supplier) {
        throw new NotFoundException('Supplier not found.');
      } else {
        return supplier;
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    try {
      const payload = plainToClass(Supplier, updateSupplierDto);
      return await this.supplierRepository.update(id, payload);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.supplierRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
