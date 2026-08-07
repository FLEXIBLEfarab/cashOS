import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Одна позиция для возврата.
 */
export class RefundItemDto {
  @ApiProperty({
    example: 'sale-item-uuid-1234-5678-abcd-ef1234567890',
    description: 'UUID позиции оригинальной продажи (saleItemId)',
  })
  @IsUUID('4', { message: 'saleItemId должен быть валидным UUID v4' })
  saleItemId: string;

  @ApiProperty({
    example: 1,
    description: 'Количество единиц товара для возврата (не более кол-ва в чеке)',
    minimum: 1,
    type: Number,
  })
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @IsPositive({ message: 'Количество должно быть больше нуля' })
  quantity: number;
}

/**
 * DTO для создания возврата по продаже.
 * Поддерживает частичный и полный возврат.
 */
export class RefundSaleDto {
  @ApiProperty({
    example: 'sale-uuid-1234-5678-abcd-ef1234567890',
    description: 'UUID оригинальной продажи, по которой оформляется возврат',
  })
  @IsUUID('4', { message: 'saleId должен быть валидным UUID v4' })
  @IsNotEmpty()
  saleId: string;

  @ApiProperty({
    example: 'shift-uuid-1234-5678-abcd-ef1234567890',
    description: 'UUID текущей открытой смены, в которой производится возврат',
  })
  @IsUUID('4', { message: 'shiftId должен быть валидным UUID v4' })
  @IsNotEmpty()
  shiftId: string;

  @ApiPropertyOptional({
    type: [RefundItemDto],
    description:
      'Список позиций для частичного возврата. ' +
      'Если не указан или пустой — производится полный возврат всего чека.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Если указываете позиции для возврата, добавьте минимум одну' })
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
  items?: RefundItemDto[];

  @ApiProperty({
    example: 'Товар ненадлежащего качества (брак)',
    description: 'Причина возврата (обязательна для документооборота)',
  })
  @IsString({ message: 'Причина возврата должна быть строкой' })
  @IsNotEmpty({ message: 'Укажите причину возврата' })
  reason: string;
}
