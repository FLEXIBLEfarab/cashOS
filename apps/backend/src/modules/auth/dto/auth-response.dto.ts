import { ApiProperty } from '@nestjs/swagger';

/**
 * Полезная нагрузка JWT токена.
 * Хранится в access и refresh токенах.
 */
export class UserPayloadDto {
  @ApiProperty({ description: 'UUID пользователя (subject)' })
  sub: string;

  @ApiProperty({ description: 'Email пользователя' })
  email: string;

  @ApiProperty({
    description: 'Роль пользователя в системе',
    enum: ['admin', 'cashier', 'manager', 'owner'],
    example: 'cashier',
  })
  role: string;
}

/**
 * Ответ на успешную аутентификацию / обновление токена.
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access токен (срок действия: 15 минут)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh токен (срок действия: 7 дней)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Тип токена',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Срок жизни access токена в секундах',
    example: 900,
  })
  expiresIn: number;
}
