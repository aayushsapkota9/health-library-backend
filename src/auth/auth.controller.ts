import {
  Controller,
  Request,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
// import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { LoginUserDto } from 'src/user/dto/create-user-dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ErrorMessage, SuccessMessage } from 'src/interfaces/common.interface';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { giveSwaggerResponseMessage } from 'src/helpers/swagger-message';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    // private userService: UserService,
  ) {}

  //--------------------------------------------------------------------------------------------------------------------------
  @ApiOperation({ summary: 'Login a user' })
  @ApiOkResponse({
    status: 200,
    description: giveSwaggerResponseMessage(SuccessMessage.LOGIN),
  })
  @ApiBadRequestResponse({
    status: 404,
    description: giveSwaggerResponseMessage(ErrorMessage.NOT_FOUND, 'User'),
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Body() loginBody: LoginUserDto) {
    return this.authService.login(loginBody);
  }
  //--------------------------------------------------------------------------------------------------------------------------

  @ApiSecurity('basic')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Get('/user')
  getProfile(@Request() req) {
    return req;
  }
}
