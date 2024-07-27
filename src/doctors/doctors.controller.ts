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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { GlobalFileUploadConfig } from 'src/common/config/file-upload.config';
import { DepartmentValue } from 'src/interfaces/enums/department.enums';

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
  @Post()
  @ResponseMessage(SuccessMessage.REGISTER, 'You are')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'documentFront', maxCount: 1 },
        { name: 'documentBack', maxCount: 1 },
      ],
      GlobalFileUploadConfig,
    ),
  )
  async register(
    @Body() createDoctorDto: CreateDoctorDto,
    @UploadedFiles()
    files: {
      documentFront?: Express.Multer.File[];
      documentBack?: Express.Multer.File[];
    },
  ) {
    if (!files.documentFront) {
      throw new BadRequestException(['documentFront is required']);
    }

    if (!files.documentBack) {
      throw new BadRequestException(['documentBack is required']);
    }
    const user = await this.doctorsService.create(createDoctorDto, files);
    return user;
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @ApiOperation({ summary: 'Get all doctors' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Doctors'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Doctors')
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.doctorsService.findAll(query);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }
  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Update a existing doctor' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.PATCH, 'Doctor'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.PATCH, 'Doctor')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'documentFront', maxCount: 1 },
        { name: 'documentBack', maxCount: 1 },
      ],
      {
        dest: './upload',
      },
    ),
  )
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @UploadedFiles()
    files: {
      documentFront?: Express.Multer.File[];
      documentBack?: Express.Multer.File[];
    },
  ) {
    return this.doctorsService.update(id, updateDoctorDto, files);
  }
  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Delete a doctor' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.DELETE, 'Doctor'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.DELETE, 'Doctor')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }

  //--------------------------------------------------------------------------------------------------------------------------

  @ApiOperation({ summary: 'Get all doctors' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Doctors'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Doctors')
  @Get('/hospital/:hospitalId/:departmentId')
  findDoctorByHospitalAndDepartment(
    @Param('hospitalId') hospitalId: string,
    @Param('departmentId') departmentId: DepartmentValue,
  ) {
    return this.doctorsService.findByHospitalAndDepartment(
      hospitalId,
      departmentId,
    );
  }
}
