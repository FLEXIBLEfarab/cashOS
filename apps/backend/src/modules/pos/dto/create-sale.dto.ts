import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsPositive,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Способ оплаты.
 * Используется в Казахстане: наличные, карта, QR (Kaspi QR и др.) или смешанный.
 */
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  QR = 'qr',
  MIXED = 'mixed',
}

/**
 * Одна позиция в чеке продажи.
 */
export class SaleItemDto {
  @ApiProperty({
    example: 'product-uuid-1234-5678-abcd-ef1234567890',
    description: 'UUID товара из каталога',
  })
  @IsUUID('4', { message: 'productId должен быть валидным UUID v4' })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Количество единиц товара',
    minimum: 1,
    type: Number,
  })
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @IsPositive({ message: 'Количество должно быть больше нуля' })
  quantity: number;

  @ApiProperty({
    example: 2500,
    description: 'Цена за единицу товара (в тенге, ₸)',
    minimum: 0,
    type: Number,
  })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  unitPrice: number;

  @ApiPropertyOptional({
    example: 250,
    description: 'Скидка на данную позицию (в тенге, ₸)',
    minimum: 0,
    default: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

/**
 * DTO для создания продажи (чека) в POS-системе.
 */
export class CreateSaleDto {
  @ApiProperty({
    example: 'shift-uuid-1234-5678-abcd-ef1234567890',
    description: 'UUID текущей открытой смены',
  })
  @IsUUID('4', { message: 'shiftId должен быть валидным UUID v4' })
  @IsNotEmpty()
  shiftId: string;

  @ApiPropertyOptional({
    example: 'customer-uuid-1234-5678-abcd-ef1234567890',
    description: 'UUID покупателя (для программы лояльности / бонусов)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'customerId должен быть валидным UUID v4' })
  customerId?: string;

  @ApiProperty({
    type: [SaleItemDto],
    description: 'Список позиций чека (минимум 1 позиция)',
  })
  @IsArray({ message: 'Позиции чека должны быть массивом' })
  @ArrayMinSize(1, { message: 'Чек должен содержать минимум одну позицию' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ApiProperty({
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
    example: PaymentMethod.CARD,
    description: 'Способ оплаты',
  })
  @IsEnum(PaymentMethod, { message: 'Укажите корректный способ оплаты: cash, card, qr, mixed' })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    example: 10000,
    description:
      'Сумма наличных, переданных кассиру (обязательно при paymentMethod=cash или mixed). ' +
      'Используется для расчёта сдачи.',
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cashAmount?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Скидка на весь чек (в тенге, ₸)',
    minimum: 0,
    default: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDiscount?: number;
}
