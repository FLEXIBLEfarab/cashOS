import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, SplitPaymentItemDto } from './create-sale.dto';
import { RefundItemDto } from './refund-sale.dto';

// ─── OFD / Fiscal ─────────────────────────────────────────────────────────────

export class FiscalReceiptDto {
  @ApiProperty({ example: 'FN-1722820800000-4521', description: 'Номер фискального чека' })
  fiscalReceiptNumber: string;

  @ApiProperty({ example: 'A3B7XK29QM', description: 'Фискальный признак (ФП)' })
  fiscalSign: string;

  @ApiProperty({
    example: 'https://consumer.oofd.kz/tickets?fiscalSign=A3B7XK29QM',
    description: 'QR-ссылка ОФД для проверки чека',
  })
  ofdQrUrl: string;

  @ApiProperty({ example: 'OOFD.kz', description: 'Наименование ОФД-провайдера' })
  ofdProvider: string;

  @ApiProperty({ example: '2026-08-05T10:30:01.000Z', description: 'Время фискальной регистрации (UTC)' })
  registeredAt: string;
}

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

  @ApiPropertyOptional({ example: null, nullable: true })
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

  @ApiProperty({ example: 0, description: 'Сумма внесений наличных (₸)' })
  cashInTotal: number;

  @ApiProperty({ example: 0, description: 'Сумма выемок наличных (₸)' })
  cashOutTotal: number;

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

  @ApiProperty({ example: 125000, description: 'Ожидаемая сумма наличных на конец смены' })
  expectedCash: number;

  @ApiProperty({ example: 0, description: 'Расхождение (факт − ожидание). Отрицательное = недостача.' })
  discrepancy: number;
}

// ─── Shift Report (X/Z отчёт) ─────────────────────────────────────────────────

export class PaymentMethodTotalsDto {
  @ApiProperty({ example: 50000, description: 'Итого наличными (₸)' })
  cash: number;

  @ApiProperty({ example: 45000, description: 'Итого картой (₸)' })
  card: number;

  @ApiProperty({ example: 30000, description: 'Итого Kaspi Pay (₸)' })
  kaspiPay: number;

  @ApiProperty({ example: 0, description: 'Итого QR (₸)' })
  qr: number;
}

export class ShiftReportDto {
  @ApiProperty({ example: 'X', enum: ['X', 'Z'], description: 'X-отчёт — без закрытия смены. Z-отчёт — закрытие.' })
  reportType: 'X' | 'Z';

  @ApiProperty({ example: '2026-08-05T18:00:00.000Z' })
  generatedAt: string;

  shiftId: string;
  terminalId: string;
  cashierId: string;
  openedAt: string;
  closedAt: string | null;
  status: 'open' | 'closed';

  // ─── Продажи ─────────────────────────────────────────────────────────────
  @ApiProperty({ example: 15, description: 'Количество продаж' })
  totalSalesCount: number;

  @ApiProperty({ example: 125000, description: 'Сумма всех продаж (₸)' })
  totalSalesAmount: number;

  @ApiProperty({ example: 2, description: 'Количество возвратов' })
  totalRefundsCount: number;

  @ApiProperty({ example: 5000, description: 'Сумма всех возвратов (₸)' })
  totalRefundsAmount: number;

  @ApiProperty({ example: 120000, description: 'Чистая выручка (продажи − возвраты) (₸)' })
  netAmount: number;

  // ─── По методам оплаты ────────────────────────────────────────────────────
  @ApiProperty({ type: PaymentMethodTotalsDto })
  paymentTotals: PaymentMethodTotalsDto;

  // ─── Движение наличных ────────────────────────────────────────────────────
  @ApiProperty({ example: 50000, description: 'Начальная сумма наличных (₸)' })
  openingCash: number;

  @ApiProperty({ example: 10000, description: 'Итого внесено наличных (₸)' })
  cashInTotal: number;

  @ApiProperty({ example: 30000, description: 'Итого изъято наличных (₸)' })
  cashOutTotal: number;

  @ApiProperty({ example: 80000, description: 'Ожидаемая сумма наличных в кассе (₸)' })
  expectedCashInDrawer: number;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Фактическая сумма (только для Z-отчёта)' })
  closingCash: number | null;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Расхождение (только для Z-отчёта)' })
  discrepancy: number | null;
}

// ─── Cash In/Out ───────────────────────────────────────────────────────────────

export class CashInOutResponseDto {
  @ApiProperty({ example: 'op-uuid-1234', description: 'UUID операции' })
  operationId: string;

  @ApiProperty({ enum: ['cash_in', 'cash_out'], example: 'cash_in' })
  operationType: 'cash_in' | 'cash_out';

  @ApiProperty({ example: 'shift-uuid-1234' })
  shiftId: string;

  @ApiProperty({ example: 'cashier-uuid-1234' })
  cashierId: string;

  @ApiProperty({ example: 10000, description: 'Сумма операции (₸)' })
  amount: number;

  @ApiProperty({ example: 'Пополнение разменной монетой', description: 'Причина/комментарий' })
  reason: string;

  @ApiProperty({ example: '2026-08-05T12:00:00.000Z' })
  createdAt: string;
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

  @ApiProperty({ example: 5000, description: 'Итого по позиции (₸)' })
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

  @ApiProperty({ example: 'RCP-1722820800000', description: 'Номер чека' })
  receiptNumber: string;

  @ApiProperty({ type: [SaleItemResponseDto] })
  items: SaleItemResponseDto[];

  @ApiProperty({ example: 5000, description: 'Сумма до скидки (₸)' })
  subtotal: number;

  @ApiProperty({ example: 0, description: 'Скидка на чек (₸)' })
  totalDiscount: number;

  @ApiProperty({ example: 5000, description: 'Итого к оплате (₸)' })
  totalAmount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.KASPI_PAY })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ type: [SplitPaymentItemDto], nullable: true, description: 'Детали смешанной оплаты' })
  splitPayments: SplitPaymentItemDto[] | null;

  @ApiPropertyOptional({ example: null, nullable: true, description: 'Наличные (при cash-оплате)' })
  cashAmount: number | null;

  @ApiProperty({ example: 0, description: 'Сдача (₸)' })
  changeAmount: number;

  @ApiProperty({ enum: ['completed', 'refunded'], example: 'completed' })
  status: 'completed' | 'refunded';

  @ApiProperty({ type: FiscalReceiptDto, description: 'Фискальный чек от ОФД' })
  fiscalReceipt: FiscalReceiptDto;

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

  @ApiProperty({ example: false, description: 'true = полный возврат всего чека' })
  isFullRefund: boolean;

  @ApiProperty({ type: FiscalReceiptDto, description: 'Фискальный чек возврата от ОФД' })
  fiscalReceipt: FiscalReceiptDto;

  @ApiProperty({ example: '2026-08-05T11:00:00.000Z' })
  createdAt: string;
}
