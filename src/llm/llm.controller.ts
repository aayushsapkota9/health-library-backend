import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LlmService } from './llm.service';
import { CreateLlmDto } from './dto/create-llm.dto';
import { UpdateLlmDto } from './dto/update-llm.dto';
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

@ApiTags('llm')
@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}
  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Get response from LLM' })
  @ApiOkResponse({
    status: 201,
    description: giveSwaggerResponseMessage(
      SuccessMessage.CREATE,
      'Message is',
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
  @ResponseMessage(SuccessMessage.REGISTER, 'Message is')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.STAFF)
  @Post()
  create(@Body() createLlmDto: CreateLlmDto) {
    return createLlmDto;
  }

  @Get()
  findAll() {
    return this.llmService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.llmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLlmDto: UpdateLlmDto) {
    return this.llmService.update(+id, updateLlmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.llmService.remove(+id);
  }
}
