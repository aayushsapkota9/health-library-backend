import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
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
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { giveSwaggerResponseMessage } from 'src/helpers/swagger-message';
import { CurrentUser } from './decorators/get-user.decorator';
import { StaffService } from 'src/staff/staff.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly staffService: StaffService,
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently logged user based on JWT' })
  @ApiOkResponse({
    status: 200,
    description: giveSwaggerResponseMessage(SuccessMessage.FETCH),
  })
  @ApiBadRequestResponse({
    status: 404,
    description: giveSwaggerResponseMessage(ErrorMessage.NOT_FOUND, 'User'),
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: ErrorMessage.INTERNAL_SERVER_ERROR,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PATIENT, Role.STAFF)
  @Get('/user/me')
  async getProfile(
    @CurrentUser() user: { userId: string; email: string; role: Role },
  ) {
    if (!user.email) {
      throw new UnauthorizedException('User not authenticated');
    }
    const others = await this.authService.getUserInfo(user.userId);
    return others;
  }
}
