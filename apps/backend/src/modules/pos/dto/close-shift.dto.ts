import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CloseShiftDto {
  @ApiProperty({
    example: 'shift-uuid-1234-5678-abcd-ef1234567890',
    description: 'UUID смены, которую необходимо закрыть',
  })
  @IsUUID('4', { message: 'shiftId должен быть валидным UUID v4' })
  @IsNotEmpty({ message: 'shiftId обязателен' })
  shiftId: string;

  @ApiProperty({
    example: 125000,
    description: 'Фактическая сумма наличных в кассе на закрытие смены (в тенге, ₸)',
    minimum: 0,
    type: Number,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'closingCash должен быть числом' })
  @Min(0, { message: 'Итоговая сумма наличных не может быть отрицательной' })
  closingCash: number;

  @ApiPropertyOptional({
    example: 'Смена закрыта без замечаний. Инкассация произведена.',
    description: 'Примечание к закрытию смены (расхождения, инкассация и т.д.)',
  })
  @IsOptional()
  @IsString({ message: 'Примечание должно быть строкой' })
  note?: string;
}
