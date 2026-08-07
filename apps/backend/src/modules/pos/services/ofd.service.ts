import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { FiscalReceiptDto, SaleResponseDto } from '../dto/pos-response.dto';

/**
 * OfdService — сервис фискализации чеков через ОФД.
 *
 * Имитирует отправку данных чека к фискальному регистратору
 * и последующую передачу в ОФД (Оператор Фискальных Данных).
 *
 * Поддерживаемые ОФД-провайдеры в Казахстане:
 * - OOFD.kz (ТОО «Центр Электронной Коммерции»)
 * - Taxpayer.kz
 *
 * TODO (Шаг 5): Заменить имитацию на реальный HTTP-вызов к OOFD API:
 *   POST https://api.oofd.kz/api/v1/ticket
 */
@Injectable()
export class OfdService {
  private readonly logger = new Logger(OfdService.name);

  private readonly OFD_PROVIDER = 'OOFD.kz';
  private readonly OFD_BASE_URL = 'https://consumer.oofd.kz/tickets';

  /**
   * Регистрирует фискальный чек продажи в ОФД.
   * Возвращает номер фискального чека и QR-ссылку.
   */
  async registerSaleReceipt(sale: SaleResponseDto): Promise<FiscalReceiptDto> {
    this.logger.log(
      `📟 Фискализация чека: saleId=${sale.saleId}, сумма=${sale.totalAmount} ₸`,
    );

    try {
      // Имитация задержки сетевого вызова к ОФД API (~50-150 мс)
      await this.simulateOfdApiCall();

      const fiscalSign = this.generateFiscalSign();
      const fiscalReceiptNumber = this.generateReceiptNumber('FN');

      const receipt: FiscalReceiptDto = {
        fiscalReceiptNumber,
        fiscalSign,
        ofdQrUrl: `${this.OFD_BASE_URL}?fiscalSign=${fiscalSign}&receiptId=${fiscalReceiptNumber}`,
        ofdProvider: this.OFD_PROVIDER,
        registeredAt: new Date().toISOString(),
      };

      this.logger.log(
        `✅ Чек зафискализирован: ${fiscalReceiptNumber} (ФП: ${fiscalSign})`,
      );

      return receipt;
    } catch (error) {
      this.logger.error(
        `❌ Ошибка фискализации чека saleId=${sale.saleId}: ${(error as Error).message}`,
      );
      // В продакшне: сохранить чек в очередь для повторной фискализации (Redis/RabbitMQ)
      throw new ServiceUnavailableException(
        'Сервис ОФД временно недоступен. Чек будет зафискализирован автоматически.',
      );
    }
  }

  /**
   * Регистрирует фискальный чек возврата в ОФД.
   */
  async registerRefundReceipt(
    refundId: string,
    originalFiscalReceiptNumber: string,
    refundAmount: number,
  ): Promise<FiscalReceiptDto> {
    this.logger.log(
      `📟 Фискализация возврата: refundId=${refundId}, сумма=${refundAmount} ₸`,
    );

    await this.simulateOfdApiCall();

    const fiscalSign = this.generateFiscalSign();
    const fiscalReceiptNumber = this.generateReceiptNumber('FN-RFD');

    const receipt: FiscalReceiptDto = {
      fiscalReceiptNumber,
      fiscalSign,
      ofdQrUrl: `${this.OFD_BASE_URL}?fiscalSign=${fiscalSign}&receiptId=${fiscalReceiptNumber}&type=refund`,
      ofdProvider: this.OFD_PROVIDER,
      registeredAt: new Date().toISOString(),
    };

    this.logger.log(
      `✅ Чек возврата зафискализирован: ${fiscalReceiptNumber}`,
    );

    return receipt;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  /**
   * Генерирует уникальный фискальный признак (ФП) — 10 символов.
   * В реальной системе ФП формирует ФР (фискальный регистратор).
   */
  private generateFiscalSign(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 10 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }

  /**
   * Генерирует номер фискального чека в формате PREFIX-timestamp-seq.
   */
  private generateReceiptNumber(prefix: string): string {
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${Date.now()}-${seq}`;
  }

  /**
   * Имитирует задержку ОФД API (50–150 мс).
   */
  private async simulateOfdApiCall(): Promise<void> {
    const delay = 50 + Math.floor(Math.random() * 100);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
