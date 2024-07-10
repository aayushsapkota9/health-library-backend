import { Injectable } from '@nestjs/common';
import { CreateCustomerBillDto } from './dto/create-customer-bill.dto';
import { UpdateCustomerBillDto } from './dto/update-customer-bill.dto';

@Injectable()
export class CustomerBillService {
  create(createCustomerBillDto: CreateCustomerBillDto) {
    console.log(createCustomerBillDto);
    return 'This action adds a new customerBill';
  }

  findAll() {
    return `This action returns all customerBill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customerBill`;
  }

  update(id: number, updateCustomerBillDto: UpdateCustomerBillDto) {
    console.log(updateCustomerBillDto);
    return `This action updates a #${id} customerBill`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerBill`;
  }
}
