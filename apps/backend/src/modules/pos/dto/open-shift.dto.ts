import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class OpenShiftDto {
  @ApiProperty({
    example: 'c1d2e3f4-a5b6-7890-abcd-ef1234567890',
    description: 'UUID кассового терминала (POS-устройства)',
  })
  @IsUUID('4', { message: 'terminalId должен быть валидным UUID v4' })
  @IsNotEmpty({ message: 'terminalId обязателен' })
  terminalId: string;

  @ApiProperty({
    example: 50000,
    description: 'Начальная сумма наличных в кассе на открытие смены (в тенге, ₸)',
    minimum: 0,
    type: Number,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'openingCash должен быть числом' })
  @Min(0, { message: 'Начальная сумма наличных не может быть отрицательной' })
  openingCash: number;

  @ApiPropertyOptional({
    example: 'Магазин Алматы #1, Касса №2',
    description: 'Дополнительное примечание к открытию смены',
  })
  @IsOptional()
  @IsString({ message: 'Примечание должно быть строкой' })
  note?: string;
}
