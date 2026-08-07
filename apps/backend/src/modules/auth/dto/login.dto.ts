import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@chetka.kz',
    description: 'Email адрес пользователя',
  })
  @IsEmail({}, { message: 'Введите корректный email адрес' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Пароль пользователя (минимум 8 символов)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(128, { message: 'Пароль не должен превышать 128 символов' })
  password: string;
}
