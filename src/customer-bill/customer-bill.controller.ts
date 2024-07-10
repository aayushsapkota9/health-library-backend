import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomerBillService } from './customer-bill.service';
import { CreateCustomerBillDto } from './dto/create-customer-bill.dto';
import { UpdateCustomerBillDto } from './dto/update-customer-bill.dto';

@Controller('customer-bill')
export class CustomerBillController {
  constructor(private readonly customerBillService: CustomerBillService) {}

  @Post()
  create(@Body() createCustomerBillDto: CreateCustomerBillDto) {
    return this.customerBillService.create(createCustomerBillDto);
  }

  @Get()
  findAll() {
    return this.customerBillService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerBillService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerBillDto: UpdateCustomerBillDto,
  ) {
    return this.customerBillService.update(+id, updateCustomerBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerBillService.remove(+id);
  }
}
