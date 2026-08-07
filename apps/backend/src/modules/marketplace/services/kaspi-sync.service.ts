import { Injectable, Logger } from '@nestjs/common';
import { SyncScope } from '../dto/sync-request.dto';
import {
  SyncLogEntryDto,
  SyncResultSummaryDto,
  SyncStatus,
} from '../dto/sync-status.dto';

/**
 * Внутренняя структура товара для маппинга в формат Kaspi.
 * TODO (Шаг 5): Брать из ProductRepository (TypeORM).
 */
interface InternalProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  categoryCode: string;
  brandName: string;
}

/**
 * Формат товара для Kaspi Seller API.
 * Документация: https://kaspi.kz/merchantcabinet/api/docs
 */
interface KaspiProductPayload {
  merchantSku: string;
  name: string;
  price: number;
  availableCount: number;
  barcode: string;
  kaspiCategoryCode: string;
  brand: string;
}

/**
 * KaspiSyncService — сервис синхронизации каталога, цен и остатков
 * с Kaspi Магазином через Kaspi Seller API.
 *
 * Маппинг: InternalProduct → KaspiProductPayload
 * TODO (Шаг 5): Заменить имитацию на реальный Kaspi Seller API HTTP клиент.
 */
@Injectable()
export class KaspiSyncService {
  private readonly logger = new Logger(KaspiSyncService.name);

  private readonly KASPI_API_BASE = 'https://kaspi.kz/merchant-api/v1';
  private readonly BATCH_SIZE = 50; // Kaspi принимает до 50 товаров за запрос

  /**
   * Синхронизирует данные с Kaspi по указанной области.
   * Возвращает итоговую сводку и лог операции.
   */
  async sync(
    scope: SyncScope,
    warehouseId?: string,
  ): Promise<{ result: SyncResultSummaryDto; logs: SyncLogEntryDto[] }> {
    const startTime = Date.now();
    const logs: SyncLogEntryDto[] = [];

    this.addLog(logs, 'info', `Запуск синхронизации: scope=${scope}${warehouseId ? `, warehouse=${warehouseId}` : ''}`);

    let totalProcessed = 0;
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    // Получаем товары для синхронизации
    const products = await this.fetchProductsForSync(scope);
    this.addLog(logs, 'info', `Получено ${products.length} товаров для синхронизации`);

    // Обрабатываем пакетами (batches)
    for (let i = 0; i < products.length; i += this.BATCH_SIZE) {
      const batch = products.slice(i, i + this.BATCH_SIZE);
      const batchNum = Math.floor(i / this.BATCH_SIZE) + 1;

      this.addLog(logs, 'info', `Обработка пакета ${batchNum}: ${batch.length} товаров`);

      const batchResult = await this.processBatch(batch, scope, warehouseId);

      totalProcessed += batchResult.processed;
      successCount += batchResult.success;
      failedCount += batchResult.failed;
      skippedCount += batchResult.skipped;

      // Логируем ошибки пакета
      for (const error of batchResult.errors) {
        this.addLog(logs, 'warn', error.message, error.sku);
      }
    }

    const durationMs = Date.now() - startTime;

    const result: SyncResultSummaryDto = {
      totalProcessed,
      successCount,
      failedCount,
      skippedCount,
      durationMs,
    };

    const finalMessage =
      `✅ Синхронизация завершена за ${durationMs}мс: ` +
      `успешно=${successCount}, ошибок=${failedCount}, пропущено=${skippedCount}`;

    this.addLog(logs, failedCount > 0 ? 'warn' : 'info', finalMessage);
    this.logger.log(finalMessage);

    return { result, logs };
  }

  /**
   * Маппинг внутреннего товара в формат Kaspi Seller API.
   */
  mapToKaspiPayload(
    product: InternalProduct,
    warehouseId?: string,
  ): KaspiProductPayload {
    return {
      merchantSku: product.sku,
      name: product.name,
      price: Math.round(product.price),
      availableCount: product.stock,
      barcode: product.barcode,
      kaspiCategoryCode: product.categoryCode,
      brand: product.brandName,
    };
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  /**
   * Имитирует получение товаров из базы данных.
   * TODO (Шаг 5): Заменить на ProductRepository.findAll() с фильтрами.
   */
  private async fetchProductsForSync(scope: SyncScope): Promise<InternalProduct[]> {
    await new Promise((r) => setTimeout(r, 10)); // Имитация запроса к БД

    return Array.from({ length: 15 }, (_, i) => ({
      id: `product-uuid-${i + 1}`,
      sku: `SKU-${String(i + 1).padStart(5, '0')}`,
      name: `Тестовый товар ${i + 1}`,
      price: 1000 + i * 500,
      stock: Math.floor(Math.random() * 100),
      barcode: `460${String(i).padStart(10, '0')}`,
      categoryCode: 'Electronics',
      brandName: 'Brand KZ',
    }));
  }

  /**
   * Имитирует отправку пакета товаров в Kaspi API.
   * TODO (Шаг 5): Заменить на реальный HTTP POST к Kaspi Seller API.
   */
  private async processBatch(
    products: InternalProduct[],
    scope: SyncScope,
    warehouseId?: string,
  ): Promise<{
    processed: number;
    success: number;
    failed: number;
    skipped: number;
    errors: Array<{ sku: string; message: string }>;
  }> {
    await new Promise((r) => setTimeout(r, 30)); // Имитация HTTP запроса

    const errors: Array<{ sku: string; message: string }> = [];
    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const product of products) {
      // Имитируем 5% вероятность ошибки
      if (Math.random() < 0.05) {
        failed++;
        errors.push({ sku: product.sku, message: `Товар ${product.sku} отклонён Kaspi API` });
      } else if (Math.random() < 0.1) {
        skipped++; // Товар не изменился
      } else {
        success++;
      }
    }

    return {
      processed: products.length,
      success,
      failed,
      skipped,
      errors,
    };
  }

  private addLog(
    logs: SyncLogEntryDto[],
    level: 'info' | 'warn' | 'error',
    message: string,
    sku?: string,
  ): void {
    logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(sku ? { sku } : {}),
    });
  }
}
