import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO для внесения наличных в кассу (cash-in).
 * Применяется для добавления разменной монеты или пополнения кассы.
 */
export class CashInDto {
  @ApiProperty({
    example: 10000,
    description: 'Сумма внесения наличных (₸)',
    minimum: 1,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'amount должен быть числом' })
  @IsPositive({ message: 'Сумма внесения должна быть больше нуля' })
  amount: number;

  @ApiProperty({
    example: 'Пополнение разменной монетой',
    description: 'Причина или комментарий к операции внесения',
  })
  @IsString({ message: 'reason должен быть строкой' })
  @IsNotEmpty({ message: 'Укажите причину внесения' })
  reason: string;
}

/**
 * DTO для выемки (инкассации) наличных из кассы (cash-out).
 * Применяется при инкассации или плановой выемке.
 */
export class CashOutDto {
  @ApiProperty({
    example: 50000,
    description: 'Сумма выемки наличных (₸)',
    minimum: 1,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'amount должен быть числом' })
  @IsPositive({ message: 'Сумма выемки должна быть больше нуля' })
  amount: number;

  @ApiProperty({
    example: 'Инкассация (плановая)',
    description: 'Причина или комментарий к операции выемки',
  })
  @IsString({ message: 'reason должен быть строкой' })
  @IsNotEmpty({ message: 'Укажите причину выемки' })
  reason: string;
}
