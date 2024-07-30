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
  UseGuards,
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
  ApiTags,
} from '@nestjs/swagger';
import { GlobalFileUploadConfig } from 'src/common/config/file-upload.config';
import { ResponseMessage } from 'src/decorators/response.decorators';
import { giveSwaggerResponseMessage } from 'src/helpers/swagger-message';
import { SuccessMessage, ErrorMessage } from 'src/interfaces/common.interface';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('hospital')
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
  @ResponseMessage(SuccessMessage.REGISTER, 'Hospital is')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'logo', maxCount: 1 }],
      GlobalFileUploadConfig,
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(
    @Body() createHospitalDto: CreateHospitalDto,
    @UploadedFiles()
    files: {
      logo: Express.Multer.File[];
    },
  ) {
    if (!files.logo) {
      throw new BadRequestException(['logo is required']);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.hospitalService.findAll(query);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @ApiOperation({ summary: 'Get a hospitals' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Hospital'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Hospital')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalService.findOne(id);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @ApiOperation({ summary: 'To update a hospitals' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.PATCH, 'Hospital'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'logo', maxCount: 1 }],
      GlobalFileUploadConfig,
    ),
  )
  @ResponseMessage(SuccessMessage.PATCH, 'Hospital')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
    },
  ) {
    return this.hospitalService.update(id, updateHospitalDto, files);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hospitalService.remove(id);
  }
}
