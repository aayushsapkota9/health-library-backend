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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
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
import { DepartmentValue } from 'src/enums/department.enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Register a new staff' })
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
  @ResponseMessage(SuccessMessage.REGISTER, 'You are')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'photo', maxCount: 1 }],
      GlobalFileUploadConfig,
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async register(
    @Body() createStaffDto: CreateStaffDto,
    @UploadedFiles()
    files: {
      photo: Express.Multer.File[];
    },
  ) {
    if (!files.photo) {
      throw new BadRequestException(['photo is required']);
    }
    const user = await this.staffService.create(createStaffDto, files);
    return user;
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @ApiOperation({ summary: 'Get all Staff' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Staff'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.staffService.findAll(query);
  }
  //--------------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Get a staff' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Staff'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.FETCH, '')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }
  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Update a existing staff' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.PATCH, 'Staff'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.PATCH, 'Staff')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'photo', maxCount: 1 }],
      GlobalFileUploadConfig,
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
    },
  ) {
    return this.staffService.update(id, updateStaffDto, files);
  }
  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Delete a staff' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.DELETE, 'Staff'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.DELETE, 'Staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }

  //--------------------------------------------------------------------------------------------------------------------------

  @ApiOperation({ summary: 'Get all staff' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Staff'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Staff')
  @Get('/hospital/:hospitalId/:departmentId')
  findStaffByHospitalAndDepartment(
    @Param('hospitalId') hospitalId: string,
    @Param('departmentId') departmentId: DepartmentValue,
  ) {
    return this.staffService.findByHospitalAndDepartment(
      hospitalId,
      departmentId,
    );
  }
}
