import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, UserPayloadDto } from './dto/auth-response.dto';

/**
 * Модель пользователя (временная).
 * TODO: Заменить на TypeORM User Entity в Шаге 4.
 */
interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
}

/**
 * In-memory пользователи для демонстрации.
 * TODO: Перенести в UserRepository (TypeORM) в Шаге 4.
 *
 * Тестовые учётные данные:
 *   admin@chetka.kz / Password123!
 *   cashier@chetka.kz / Password123!
 */
const SEED_USERS: UserRecord[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'admin@chetka.kz',
    // bcrypt hash for 'Password123!' (rounds=12)
    passwordHash:
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J7Z3f4.Tu',
    role: 'admin',
    isActive: true,
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    email: 'cashier@chetka.kz',
    // bcrypt hash for 'Password123!' (rounds=12)
    passwordHash:
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J7Z3f4.Tu',
    role: 'cashier',
    isActive: true,
  },
];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Аутентификация пользователя по email + password.
   * Возвращает пару JWT токенов при успехе.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = SEED_USERS.find(
      (u) => u.email === dto.email && u.isActive,
    );

    // Принципиальный момент безопасности: одно сообщение об ошибке
    // для неверного email И неверного пароля (защита от enumeration attack)
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    this.logger.log(
      `✅ Успешный вход: ${user.email} (роль: ${user.role})`,
    );

    return this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  /**
   * Обновление пары токенов по refresh токену.
   */
  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    let payload: UserPayloadDto;

    try {
      payload = this.jwtService.verify<UserPayloadDto>(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Недействительный или просроченный refresh токен',
      );
    }

    const user = SEED_USERS.find(
      (u) => u.id === payload.sub && u.isActive,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Пользователь не найден или деактивирован',
      );
    }

    this.logger.log(`🔄 Обновление токена для: ${user.email}`);

    return this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  /**
   * Выход из системы.
   * TODO: В Шаге 5 — добавить refresh токен в Redis blacklist.
   */
  async logout(userId: string): Promise<{ message: string }> {
    // В продакшне: занести refreshToken в Redis blacklist с TTL = оставшееся время жизни токена
    this.logger.log(`🚪 Выход из системы: userId=${userId}`);
    return { message: 'Вы успешно вышли из системы' };
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  /**
   * Генерирует пару access + refresh JWT токенов.
   */
  private generateTokenPair(payload: UserPayloadDto): AuthResponseDto {
    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    const jwtRefreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const jwtExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m';
    const jwtRefreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtRefreshSecret,
      expiresIn: jwtRefreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 минут в секундах
    };
  }
}
