import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SupplierBillService } from './supplier-bill.service';
import { CreateSupplierBillDto } from './dto/create-supplier-bill.dto';
import { UpdateSupplierBillDto } from './dto/update-supplier-bill.dto';
import { SuccessMessage } from 'src/interfaces/common.interface';
import { ResponseMessage } from 'src/decorators/response.decorators';
import { UUID } from 'crypto';

@Controller('supplier-bill')
export class SupplierBillController {
  constructor(private readonly supplierBillService: SupplierBillService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ResponseMessage(SuccessMessage.CREATE, 'SupplierBill')
  create(@Body() createSupplierBillDto: CreateSupplierBillDto) {
    return this.supplierBillService.create(createSupplierBillDto);
  }

  @Get()
  @ResponseMessage(SuccessMessage.FETCH, 'SupplierBill')
  findAll() {
    return this.supplierBillService.findAll();
  }

  @Get(':id')
  @ResponseMessage(SuccessMessage.FETCH, 'SupplierBill')
  findOne(@Param('id') id: UUID) {
    return this.supplierBillService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage(SuccessMessage.PATCH, 'SupplierBill')
  update(
    @Param('id') id: UUID,
    @Body() updateSupplierBillDto: UpdateSupplierBillDto,
  ) {
    return this.supplierBillService.update(id, updateSupplierBillDto);
  }

  @Delete(':id')
  @ResponseMessage(SuccessMessage.DELETE, 'SupplierBill')
  remove(@Param('id') id: string) {
    return this.supplierBillService.remove(+id);
  }
}
