import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorators/response.decorators';
import { giveSwaggerResponseMessage } from 'src/helpers/swagger-message';
import { SuccessMessage, ErrorMessage } from 'src/interfaces/common.interface';

@ApiTags('doctor')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Register a new doctor' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.REGISTER, 'You are'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @Post('/register')
  @ResponseMessage(SuccessMessage.REGISTER, 'You are')
  async register(@Body() createDoctorDto: CreateDoctorDto) {
    const user = await this.doctorsService.create(createDoctorDto);
    return user;
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Get()
  findAll() {
    return this.doctorsService.findAll();
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(+id, updateDoctorDto);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }
}
