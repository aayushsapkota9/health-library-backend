import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { ResponseMessage } from 'src/decorators/response.decorators';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { giveSwaggerResponseMessage } from 'src/helpers/swagger-message';
import { SuccessMessage, ErrorMessage } from 'src/interfaces/common.interface';

@Controller('diseases')
@ApiTags('diseases')
export class DiseasesController {
  constructor(private readonly diseasesService: DiseasesService) {}
  //--------------------------------------------------------------------------------------------------------------------------

  @Post()
  @ApiOperation({ summary: 'Create a new disease' })
  @ApiBody({ type: CreateDiseaseDto })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(SuccessMessage.CREATE, 'Disease'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.CREATE, 'Disease')
  create(@Body() createDiseaseDto: CreateDiseaseDto) {
    return this.diseasesService.create(createDiseaseDto);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Get all diseases with pagination' })
  @ApiOkResponse({
    status: 200,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Diseases'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.FETCH, 'Diseases')
  findAll(@Query() query: PaginationDto) {
    return this.diseasesService.findAll(query);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Get(':id')
  @ApiOperation({ summary: 'Get a single disease by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Disease ID' })
  @ApiOkResponse({
    status: 200,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH, 'Disease'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  findOne(@Param('id') id: string) {
    return this.diseasesService.findOne(id);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Patch(':id')
  @ApiOperation({ summary: 'Update a disease by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Disease ID' })
  @ApiBody({ type: UpdateDiseaseDto })
  @ApiOkResponse({
    status: 200,
    description: giveSwaggerResponseMessage(SuccessMessage.PATCH, 'Disease'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.PATCH, 'Disease')
  update(@Param('id') id: string, @Body() updateDiseaseDto: UpdateDiseaseDto) {
    return this.diseasesService.update(id, updateDiseaseDto);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a disease by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Disease ID' })
  @ApiOkResponse({
    status: 200,
    description: giveSwaggerResponseMessage(SuccessMessage.DELETE, 'Disease'),
  })
  @ApiBadRequestResponse({
    status: 400,
    description: ErrorMessage.INVALID_BODY,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @ResponseMessage(SuccessMessage.DELETE, 'Disease')
  remove(@Param('id') id: string) {
    return this.diseasesService.remove(id);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Get('item/search')
  @ApiOperation({ summary: 'Search diseases' })
  @ApiOkResponse({
    status: 200,
    description: giveSwaggerResponseMessage(
      SuccessMessage.FETCH,
      'Search Results',
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
  search(@Query() paginationDto: PaginationDto) {
    return this.diseasesService.search(paginationDto);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @Get('item/search/alphabet')
  @ApiOperation({ summary: 'Search diseases by name alphabetically' })
  @ApiOkResponse({
    status: 200,
    description: giveSwaggerResponseMessage(
      SuccessMessage.FETCH,
      'Search Results by Alphabet',
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
  searchByAlphabet(@Query() paginationDto: PaginationDto) {
    return this.diseasesService.searchByAlphabet(paginationDto);
  }
}
