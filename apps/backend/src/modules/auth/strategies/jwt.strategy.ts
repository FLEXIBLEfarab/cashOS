import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayloadDto } from '../dto/auth-response.dto';

/**
 * Стратегия JWT для Passport.
 * Извлекает и валидирует Bearer токен из заголовка Authorization.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Вызывается после успешной верификации подписи токена.
   * Возвращённый объект будет доступен в `request.user`.
   */
  validate(payload: UserPayloadDto): UserPayloadDto {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException(
        'Недействительный токен: отсутствуют обязательные поля',
      );
    }
    return payload;
  }
}
