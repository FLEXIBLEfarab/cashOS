import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateKaspiPaymentDto,
  KaspiPaymentResponseDto,
  KaspiPaymentStatus,
  KaspiPaymentStatusResponseDto,
  RefundKaspiPaymentDto,
} from '../dto/kaspi-payment.dto';

/**
 * KaspiPayService — интеграция с Kaspi Pay API для QR-оплаты на кассе.
 *
 * Документация Kaspi Pay Merchant API:
 *   https://kaspi.kz/merchantcabinet/api/docs
 *
 * Переменные окружения (.env):
 *   KASPI_API_KEY        — API ключ от Kaspi Merchant Cabinet
 *   KASPI_MERCHANT_ID    — ID торговца в системе Kaspi
 *   KASPI_API_BASE_URL   — https://kaspi.kz/pay/api/v1 (prod)
 *                       или https://stage.kaspi.kz/pay/api/v1 (sandbox)
 *
 * Текущий статус: SKELETON (имитация).
 * TODO (Шаг 5 — Integration):
 *   1. Получить реальные credentials в Kaspi Merchant Cabinet
 *   2. Заменить симуляцию на реальные HTTP запросы
 *   3. Настроить Webhook для входящих уведомлений от Kaspi
 */
@Injectable()
export class KaspiPayService {
  private readonly logger = new Logger(KaspiPayService.name);

  private readonly apiKey: string;
  private readonly merchantId: string;
  private readonly baseUrl: string;
  private readonly isConfigured: boolean;

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get<string>('KASPI_API_KEY', '');
    this.merchantId = config.get<string>('KASPI_MERCHANT_ID', '');
    this.baseUrl = config.get<string>(
      'KASPI_API_BASE_URL',
      'https://kaspi.kz/pay/api/v1',
    );

    this.isConfigured = Boolean(this.apiKey && this.merchantId);

    if (!this.isConfigured) {
      this.logger.warn(
        '⚠️ KASPI_API_KEY или KASPI_MERCHANT_ID не заданы в .env. ' +
        'Kaspi Pay работает в режиме симуляции.',
      );
    } else {
      this.logger.log(
        `✅ Kaspi Pay настроен: merchant=${this.merchantId}, url=${this.baseUrl}`,
      );
    }
  }

  // ─── Создание QR-платежа ──────────────────────────────────────────────────

  /**
   * Создаёт новый Kaspi Pay QR-платёж.
   *
   * Реальный API запрос:
   * POST {baseUrl}/payments
   * Authorization: Bearer {apiKey}
   * Body: { merchantId, orderId, amount, description }
   *
   * Ответ: { paymentId, qrCode (base64), deepLink, expiresAt }
   */
  async createPayment(dto: CreateKaspiPaymentDto): Promise<KaspiPaymentResponseDto> {
    this.logger.log(
      `💳 Создание Kaspi Pay платежа: orderId=${dto.orderId}, сумма=${dto.amount} ₸`,
    );

    if (this.isConfigured) {
      return this.createRealPayment(dto);
    }

    // ─── Симуляция (без реальных credentials) ─────────────────────────────
    return this.simulateCreatePayment(dto);
  }

  // ─── Проверка статуса ─────────────────────────────────────────────────────

  /**
   * Проверяет статус платежа.
   * Вызывается polling'ом каждые 2 секунды до получения финального статуса.
   *
   * Реальный API запрос:
   * GET {baseUrl}/payments/{paymentId}/status
   * Authorization: Bearer {apiKey}
   */
  async getPaymentStatus(paymentId: string): Promise<KaspiPaymentStatusResponseDto> {
    this.logger.debug(`🔍 Проверка статуса Kaspi Pay: paymentId=${paymentId}`);

    if (this.isConfigured) {
      return this.getRealPaymentStatus(paymentId);
    }

    return this.simulateGetStatus(paymentId);
  }

  // ─── Возврат платежа ──────────────────────────────────────────────────────

  /**
   * Инициирует возврат средств по Kaspi Pay платежу.
   *
   * Реальный API запрос:
   * POST {baseUrl}/payments/{paymentId}/refund
   * Authorization: Bearer {apiKey}
   * Body: { refundAmount, reason }
   */
  async refundPayment(
    dto: RefundKaspiPaymentDto,
  ): Promise<{ success: boolean; refundId: string; message: string }> {
    this.logger.log(
      `↩️ Kaspi Pay возврат: paymentId=${dto.paymentId}, сумма=${dto.refundAmount} ₸`,
    );

    if (this.isConfigured) {
      return this.createRealRefund(dto);
    }

    return this.simulateRefund(dto);
  }

  // ─── Real API (подключить когда будут credentials) ────────────────────────

  /**
   * Реальный вызов Kaspi Pay API для создания платежа.
   * Раскомментировать и настроить после получения credentials.
   */
  private async createRealPayment(
    dto: CreateKaspiPaymentDto,
  ): Promise<KaspiPaymentResponseDto> {
    // TODO: Раскомментировать после получения реальных credentials Kaspi
    /*
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Merchant-Id': this.merchantId,
      },
      body: JSON.stringify({
        merchantId: this.merchantId,
        orderId: dto.orderId,
        amount: dto.amount,
        description: dto.description ?? `Покупка в Четка`,
        returnUrl: `${process.env.APP_URL}/v1/marketplace/kaspi/webhook`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ServiceUnavailableException(
        `Kaspi Pay API ошибка: ${error.message ?? response.statusText}`
      );
    }

    const data = await response.json();
    return {
      paymentId: data.paymentId,
      orderId: dto.orderId,
      amount: dto.amount,
      status: KaspiPaymentStatus.PENDING,
      qrCodeBase64: data.qrCode,
      deepLinkUrl: data.deepLink,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
    };
    */

    this.logger.warn('createRealPayment не реализован — используется симуляция');
    return this.simulateCreatePayment(dto);
  }

  private async getRealPaymentStatus(
    paymentId: string,
  ): Promise<KaspiPaymentStatusResponseDto> {
    // TODO: Реальный GET {baseUrl}/payments/{paymentId}/status
    /*
    const response = await fetch(
      `${this.baseUrl}/payments/${paymentId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Merchant-Id': this.merchantId,
        },
      }
    );
    const data = await response.json();
    return {
      paymentId,
      status: data.status as KaspiPaymentStatus,
      statusMessage: data.message,
      buyerPhone: data.buyerPhone ?? null,
      kaspiTransactionId: data.transactionId ?? null,
      checkedAt: new Date().toISOString(),
    };
    */

    return this.simulateGetStatus(paymentId);
  }

  private async createRealRefund(
    dto: RefundKaspiPaymentDto,
  ): Promise<{ success: boolean; refundId: string; message: string }> {
    // TODO: Реальный POST {baseUrl}/payments/{paymentId}/refund
    return this.simulateRefund(dto);
  }

  // ─── Симуляция (для разработки без credentials) ───────────────────────────

  private async simulateCreatePayment(
    dto: CreateKaspiPaymentDto,
  ): Promise<KaspiPaymentResponseDto> {
    await new Promise((r) => setTimeout(r, 100)); // Имитация сетевого запроса

    const paymentId = `KASPI-SIM-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString(); // +3 минуты

    return {
      paymentId,
      orderId: dto.orderId,
      amount: dto.amount,
      status: KaspiPaymentStatus.PENDING,
      // Симуляция QR — в реальности это настоящий QR-код
      qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      deepLinkUrl: `https://kaspi.kz/pay?id=${paymentId}&amount=${dto.amount}`,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
  }

  private async simulateGetStatus(
    paymentId: string,
  ): Promise<KaspiPaymentStatusResponseDto> {
    await new Promise((r) => setTimeout(r, 50));

    // Симуляция: для тестирования возвращаем APPROVED
    return {
      paymentId,
      status: KaspiPaymentStatus.APPROVED,
      statusMessage: 'Операция выполнена успешно (симуляция)',
      buyerPhone: '+7 777 *** ** 77',
      kaspiTransactionId: `KZ-TXN-${Date.now()}`,
      checkedAt: new Date().toISOString(),
    };
  }

  private async simulateRefund(
    dto: RefundKaspiPaymentDto,
  ): Promise<{ success: boolean; refundId: string; message: string }> {
    await new Promise((r) => setTimeout(r, 100));
    return {
      success: true,
      refundId: `KASPI-RFD-${Date.now()}`,
      message: `Возврат ${dto.refundAmount} ₸ успешно инициирован (симуляция)`,
    };
  }
}
