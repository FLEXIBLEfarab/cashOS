import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, UserPayloadDto } from './dto/auth-response.dto';

interface RequestWithUser extends Request {
  user: UserPayloadDto;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/auth/login
  // ──────────────────────────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вход в систему',
    description:
      'Аутентификация по email и паролю. При успехе возвращает пару JWT токенов (access + refresh).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Успешная аутентификация. Возвращает токены.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '❌ Неверный email или пароль.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Ошибка валидации входных данных.',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/auth/refresh
  // ──────────────────────────────────────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновление токенов',
    description:
      'Обновляет пару JWT токенов. Принимает действующий refresh токен.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Токены успешно обновлены.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '❌ Недействительный или просроченный refresh токен.',
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/auth/logout
  // ──────────────────────────────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Выход из системы',
    description:
      'Инвалидирует сессию пользователя. Требует действующего access токена.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Успешный выход из системы.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '❌ Токен отсутствует, истёк или недействителен.',
  })
  async logout(
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    return this.authService.logout(req.user.sub);
  }
}
