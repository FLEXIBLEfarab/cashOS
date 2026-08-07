import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsPositive,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsOptional,
  Min,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Методы оплаты, поддерживаемые на Казахстанском рынке.
 */
export enum PaymentMethod {
  /** Наличные (тенге) */
  CASH = 'cash',
  /** Банковская карта (терминал Visa/Mastercard) */
  CARD = 'card',
  /** Kaspi Pay (QR-оплата через Kaspi Bank) */
  KASPI_PAY = 'kaspi_pay',
  /** Универсальный QR (НБК QR, другие банки) */
  QR = 'qr',
  /** Смешанная оплата (разбивка по методам через splitPayments) */
  SPLIT = 'split',
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

  @ApiProperty({ example: 2, description: 'Количество единиц', minimum: 1 })
  @IsNumber({}, { message: 'Количество должно быть числом' })
  @IsPositive({ message: 'Количество должно быть больше нуля' })
  quantity: number;

  @ApiProperty({ example: 2500, description: 'Цена за единицу (₸)', minimum: 0 })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  unitPrice: number;

  @ApiPropertyOptional({ example: 0, description: 'Скидка на позицию (₸)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

/**
 * Одна составляющая смешанной оплаты (SPLIT).
 * Например: 3000 ₸ наличными + 7000 ₸ картой.
 */
export class SplitPaymentItemDto {
  @ApiProperty({
    enum: [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.KASPI_PAY, PaymentMethod.QR],
    example: PaymentMethod.KASPI_PAY,
    description: 'Метод оплаты (нельзя использовать SPLIT внутри SPLIT)',
  })
  @IsEnum(
    { CASH: 'cash', CARD: 'card', KASPI_PAY: 'kaspi_pay', QR: 'qr' },
    { message: 'В разбивке SPLIT допустимы только: cash, card, kaspi_pay, qr' },
  )
  method: Exclude<PaymentMethod, PaymentMethod.SPLIT>;

  @ApiProperty({
    example: 5000,
    description: 'Сумма по данному методу оплаты (₸)',
    minimum: 1,
  })
  @IsNumber({}, { message: 'Сумма должна быть числом' })
  @IsPositive({ message: 'Сумма должна быть больше нуля' })
  amount: number;
}

/**
 * DTO для создания продажи (кассового чека) в POS-системе.
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
    example: PaymentMethod.KASPI_PAY,
    description:
      'Способ оплаты. Используйте SPLIT + splitPayments для смешанной оплаты.',
  })
  @IsEnum(PaymentMethod, { message: 'Укажите корректный способ оплаты' })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    example: 10000,
    description: 'Сумма переданных наличных (обязательно при paymentMethod=cash)',
    minimum: 0,
  })
  @ValidateIf((o: CreateSaleDto) => o.paymentMethod === PaymentMethod.CASH)
  @IsNumber({}, { message: 'cashAmount должен быть числом' })
  @Min(0)
  cashAmount?: number;

  @ApiPropertyOptional({
    type: [SplitPaymentItemDto],
    description:
      'Разбивка смешанной оплаты. Обязательно при paymentMethod=split. ' +
      'Сумма по всем методам должна совпадать с totalAmount.',
  })
  @ValidateIf((o: CreateSaleDto) => o.paymentMethod === PaymentMethod.SPLIT)
  @IsArray({ message: 'splitPayments должен быть массивом' })
  @ArrayMinSize(2, { message: 'SPLIT требует минимум 2 метода оплаты' })
  @ArrayMaxSize(4, { message: 'SPLIT допускает не более 4 методов оплаты' })
  @ValidateNested({ each: true })
  @Type(() => SplitPaymentItemDto)
  splitPayments?: SplitPaymentItemDto[];

  @ApiPropertyOptional({
    example: 500,
    description: 'Скидка на весь чек (₸)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDiscount?: number;
}
