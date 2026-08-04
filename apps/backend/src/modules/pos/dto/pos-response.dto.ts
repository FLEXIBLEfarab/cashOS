import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from './create-sale.dto';
import { RefundItemDto } from './refund-sale.dto';

// ─── Shift Responses ───────────────────────────────────────────────────────────

export class ShiftResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  shiftId: string;

  @ApiProperty({ example: 'c1d2e3f4-a5b6-7890-abcd-ef1234567890' })
  terminalId: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  cashierId: string;

  @ApiProperty({ example: '2026-08-05T04:00:00.000Z' })
  openedAt: string;

  @ApiPropertyOptional({ example: '2026-08-05T20:00:00.000Z', nullable: true })
  closedAt: string | null;

  @ApiProperty({ enum: ['open', 'closed'], example: 'open' })
  status: 'open' | 'closed';

  @ApiProperty({ example: 50000, description: 'Начальная сумма наличных (₸)' })
  openingCash: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  closingCash: number | null;

  @ApiProperty({ example: 0, description: 'Общая сумма продаж за смену (₸)' })
  totalSalesAmount: number;

  @ApiProperty({ example: 0, description: 'Количество продаж за смену' })
  totalSalesCount: number;

  @ApiPropertyOptional({ example: 'Магазин Алматы #1, Касса №2', nullable: true })
  note: string | null;
}

export class CloseShiftResponseDto extends ShiftResponseDto {
  @ApiProperty({ example: '2026-08-05T20:00:00.000Z' })
  override closedAt: string;

  @ApiProperty({ example: 'closed' })
  override status: 'open' | 'closed';

  @ApiProperty({ example: 125000 })
  override closingCash: number;

  @ApiProperty({
    example: 125000,
    description: 'Ожидаемая сумма наличных (начальная + сумма продаж наличными)',
  })
  expectedCash: number;

  @ApiProperty({
    example: 0,
    description: 'Расхождение (фактическая − ожидаемая). Отрицательное = недостача.',
  })
  discrepancy: number;
}

// ─── Sale Responses ────────────────────────────────────────────────────────────

export class SaleItemResponseDto {
  @ApiProperty({ example: 'sale-item-uuid-1234' })
  saleItemId: string;

  @ApiProperty({ example: 'product-uuid-1234' })
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 2500, description: 'Цена за единицу (₸)' })
  unitPrice: number;

  @ApiProperty({ example: 0, description: 'Скидка на позицию (₸)' })
  discount: number;

  @ApiProperty({ example: 5000, description: 'Итог по позиции (₸)' })
  totalPrice: number;
}

export class SaleResponseDto {
  @ApiProperty({ example: 'd4e5f6a7-b8c9-0123-defg-hi1234567890' })
  saleId: string;

  @ApiProperty({ example: 'shift-uuid-1234' })
  shiftId: string;

  @ApiProperty({ example: 'cashier-uuid-1234' })
  cashierId: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  customerId: string | null;

  @ApiProperty({
    example: 'RCP-1722820800000',
    description: 'Номер чека (уникальный в рамках смены)',
  })
  receiptNumber: string;

  @ApiProperty({ type: [SaleItemResponseDto] })
  items: SaleItemResponseDto[];

  @ApiProperty({ example: 5000, description: 'Сумма до скидки (₸)' })
  subtotal: number;

  @ApiProperty({ example: 0, description: 'Скидка на весь чек (₸)' })
  totalDiscount: number;

  @ApiProperty({ example: 5000, description: 'Итоговая сумма к оплате (₸)' })
  totalAmount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: null, nullable: true })
  cashAmount: number | null;

  @ApiProperty({ example: 0, description: 'Сдача (₸)' })
  changeAmount: number;

  @ApiProperty({ enum: ['completed', 'refunded'], example: 'completed' })
  status: 'completed' | 'refunded';

  @ApiProperty({ example: '2026-08-05T10:30:00.000Z' })
  createdAt: string;
}

// ─── Refund Responses ──────────────────────────────────────────────────────────

export class RefundResponseDto {
  @ApiProperty({ example: 'refund-uuid-1234' })
  refundId: string;

  @ApiProperty({ example: 'sale-uuid-1234' })
  originalSaleId: string;

  @ApiProperty({ example: 'shift-uuid-1234' })
  shiftId: string;

  @ApiProperty({ example: 'cashier-uuid-1234' })
  cashierId: string;

  @ApiProperty({ example: 'RFD-1722820900000' })
  refundReceiptNumber: string;

  @ApiProperty({ type: [RefundItemDto], description: 'Пустой массив = полный возврат' })
  items: RefundItemDto[];

  @ApiProperty({ example: 2500, description: 'Сумма возврата (₸)' })
  refundAmount: number;

  @ApiProperty({ example: 'Товар ненадлежащего качества' })
  reason: string;

  @ApiProperty({ example: false, description: 'true если возврат полный (весь чек)' })
  isFullRefund: boolean;

  @ApiProperty({ example: '2026-08-05T11:00:00.000Z' })
  createdAt: string;
}
