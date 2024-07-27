import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { GlobalFileUploadConfig } from 'src/common/config/file-upload.config';
import { ResponseMessage } from 'src/decorators/response.decorators';
import { giveSwaggerResponseMessage } from 'src/helpers/swagger-message';
import { SuccessMessage, ErrorMessage } from 'src/interfaces/common.interface';
import { PaginationDto } from 'src/helpers/pagination.dto';

@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Register a new hospital' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(
      SuccessMessage.REGISTER,
      'Hospital is',
    ),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @Post()
  @ResponseMessage(SuccessMessage.REGISTER, 'Hospital is')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'backgroundImage', maxCount: 1 },
      ],
      GlobalFileUploadConfig,
    ),
  )
  create(
    @Body() createHospitalDto: CreateHospitalDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      backgroundImage?: Express.Multer.File[];
    },
  ) {
    if (!files.image) {
      throw new BadRequestException(['image is required']);
    }

    if (!files.backgroundImage) {
      throw new BadRequestException(['backgroundImage is required']);
    }
    return this.hospitalService.create(createHospitalDto, files);
  }

  //--------------------------------------------------------------------------------------------------------------------------

  @ApiOperation({ summary: 'Get all hospitals' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Hospitals'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Hospitals')
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.hospitalService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return this.hospitalService.update(id, updateHospitalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hospitalService.remove(id);
  }
}
