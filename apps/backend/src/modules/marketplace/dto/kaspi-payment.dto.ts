import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsPositive,
  IsUUID,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

/**
 * Запрос на создание Kaspi Pay QR-платежа.
 */
export class CreateKaspiPaymentDto {
  @ApiProperty({
    example: 'order-uuid-1234',
    description: 'UUID заказа/чека в системе Четка (уникальный per-payment)',
  })
  @IsUUID('4')
  orderId: string;

  @ApiProperty({
    example: 15000,
    description: 'Сумма платежа в тенге (₸)',
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 'Покупка в Магазине Четка #5',
    description: 'Описание платежа (отображается в Kaspi приложении)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}

/**
 * Статусы Kaspi Pay платежа.
 */
export enum KaspiPaymentStatus {
  /** Ожидает сканирования QR покупателем */
  PENDING = 'PENDING',
  /** Покупатель сканировал, ожидает подтверждения */
  PROCESSING = 'PROCESSING',
  /** Платёж успешен */
  APPROVED = 'APPROVED',
  /** Платёж отклонён (недостаточно средств, лимит и т.д.) */
  DECLINED = 'DECLINED',
  /** Время ожидания истекло (обычно 3 минуты) */
  TIMEOUT = 'TIMEOUT',
  /** Возврат проведён */
  REFUNDED = 'REFUNDED',
}

/**
 * Ответ при создании Kaspi Pay платежа.
 */
export class KaspiPaymentResponseDto {
  @ApiProperty({ example: 'kaspi-payment-uuid-1234', description: 'ID платежа в системе Kaspi' })
  paymentId: string;

  @ApiProperty({ example: 'order-uuid-1234' })
  orderId: string;

  @ApiProperty({ example: 15000 })
  amount: number;

  @ApiProperty({
    enum: KaspiPaymentStatus,
    example: KaspiPaymentStatus.PENDING,
  })
  status: KaspiPaymentStatus;

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgo...',
    description: 'QR-код в формате base64 PNG для отображения на кассе',
  })
  qrCodeBase64: string;

  @ApiProperty({
    example: 'https://kaspi.kz/pay?id=kaspi-payment-uuid-1234',
    description: 'Deep-link для открытия в Kaspi приложении',
  })
  deepLinkUrl: string;

  @ApiProperty({
    example: '2026-08-05T10:35:00.000Z',
    description: 'Время истечения QR-кода (обычно +3 минуты)',
  })
  expiresAt: string;

  @ApiProperty({ example: '2026-08-05T10:30:00.000Z' })
  createdAt: string;
}

/**
 * Статус существующего Kaspi Pay платежа.
 */
export class KaspiPaymentStatusResponseDto {
  @ApiProperty({ example: 'kaspi-payment-uuid-1234' })
  paymentId: string;

  @ApiProperty({ enum: KaspiPaymentStatus })
  status: KaspiPaymentStatus;

  @ApiPropertyOptional({
    example: 'Операция выполнена успешно',
    description: 'Сообщение от Kaspi о результате',
  })
  statusMessage?: string;

  @ApiPropertyOptional({
    example: '+7 777 *** ** 12',
    description: 'Маскированный номер телефона покупателя (только при APPROVED)',
    nullable: true,
  })
  buyerPhone?: string | null;

  @ApiPropertyOptional({
    example: 'KZ123456789',
    description: 'Номер транзакции в Kaspi (для сверки)',
    nullable: true,
  })
  kaspiTransactionId?: string | null;

  @ApiProperty({ example: '2026-08-05T10:30:01.000Z' })
  checkedAt: string;
}

/**
 * Запрос на возврат Kaspi Pay платежа.
 */
export class RefundKaspiPaymentDto {
  @ApiProperty({ example: 'kaspi-payment-uuid-1234', description: 'ID исходного платежа Kaspi' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ example: 15000, description: 'Сумма возврата (₸). Не более суммы оригинального платежа.' })
  @IsNumber()
  @IsPositive()
  refundAmount: number;

  @ApiPropertyOptional({ example: 'Товар ненадлежащего качества' })
  @IsOptional()
  @IsString()
  reason?: string;
}
