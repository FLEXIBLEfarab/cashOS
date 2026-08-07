import { Injectable, Logger } from '@nestjs/common';
import { SyncProductsDto, ErpProductItemDto } from './dto/sync-products.dto';
import { SyncStockDto, ErpStockItemDto } from './dto/sync-stock.dto';
import { RabbitMqProducerService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface ErpSyncProductsResult {
  organizationId: string;
  source: string;
  received: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ externalId: string; reason: string }>;
  processedAt: string;
}

export interface ErpSyncStockResult {
  organizationId: string;
  source: string;
  received: number;
  updated: number;
  errors: Array<{ externalProductId: string; reason: string }>;
  processedAt: string;
}

@Injectable()
export class ErpIntegrationService {
  private readonly logger = new Logger(ErpIntegrationService.name);

  constructor(
    private readonly rabbitMqProducer: RabbitMqProducerService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Принимает и обрабатывает номенклатуру и цены из 1С/SAP.
   * Логика: upsert продуктов в БД (create или update по externalId).
   * TODO (Шаг 5): Реализовать ProductRepository.upsertFromErp().
   */
  async syncProducts(dto: SyncProductsDto): Promise<ErpSyncProductsResult> {
    const startTime = Date.now();

    this.logger.log(
      `📥 ERP sync products: source=${dto.source}, org=${dto.organizationId}, ` +
      `count=${dto.products.length}`,
    );

    const errors: Array<{ externalId: string; reason: string }> = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const product of dto.products) {
      try {
        const result = await this.processProductUpsert(product, dto.organizationId);

        switch (result) {
          case 'created':
            created++;
            break;
          case 'updated':
            updated++;
            // Инвалидируем кэш остатков при обновлении товара
            // (warehouseId неизвестен на этом этапе — сбрасываем по productId)
            this.logger.debug(`♻️ Кэш остатков сброшен для товара: ${product.externalId}`);
            break;
          case 'skipped':
            skipped++;
            break;
        }
      } catch (error) {
        errors.push({
          externalId: product.externalId,
          reason: (error as Error).message,
        });
        this.logger.warn(
          `⚠️ Ошибка обработки товара ${product.externalId}: ${(error as Error).message}`,
        );
      }
    }

    // Публикуем событие в RabbitMQ для синхронизации WMS
    if (updated + created > 0) {
      await this.rabbitMqProducer.publish('stock.updated', {
        productId: 'batch',
        warehouseId: dto.organizationId,
        quantity: 0,
        previousQuantity: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    const result: ErpSyncProductsResult = {
      organizationId: dto.organizationId,
      source: dto.source,
      received: dto.products.length,
      created,
      updated,
      skipped,
      errors,
      processedAt: new Date().toISOString(),
    };

    this.logger.log(
      `✅ ERP products sync завершён за ${Date.now() - startTime}мс: ` +
      `создано=${created}, обновлено=${updated}, пропущено=${skipped}, ошибок=${errors.length}`,
    );

    return result;
  }

  /**
   * Принимает и обрабатывает остатки из 1С/SAP.
   * Обновляет склад в БД и инвалидирует Redis кэш.
   * TODO (Шаг 5): Реализовать StockRepository.updateFromErp().
   */
  async syncStock(dto: SyncStockDto): Promise<ErpSyncStockResult> {
    const startTime = Date.now();

    this.logger.log(
      `📦 ERP sync stock: source=${dto.source}, org=${dto.organizationId}, ` +
      `items=${dto.items.length}`,
    );

    const errors: Array<{ externalProductId: string; reason: string }> = [];
    let updated = 0;

    for (const item of dto.items) {
      try {
        await this.processStockUpdate(item, dto.organizationId);

        // Инвалидируем кэш Redis для данного товара/склада
        await this.redisService.invalidateStock(
          item.externalProductId,
          item.warehouseExternalId,
        );

        updated++;
      } catch (error) {
        errors.push({
          externalProductId: item.externalProductId,
          reason: (error as Error).message,
        });
      }
    }

    // Публикуем событие об обновлении остатков
    if (updated > 0) {
      await this.rabbitMqProducer.publish('stock.updated', {
        productId: `batch-${dto.organizationId}`,
        warehouseId: dto.filterByWarehouseId ?? dto.organizationId,
        quantity: updated,
        previousQuantity: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    const result: ErpSyncStockResult = {
      organizationId: dto.organizationId,
      source: dto.source,
      received: dto.items.length,
      updated,
      errors,
      processedAt: new Date().toISOString(),
    };

    this.logger.log(
      `✅ ERP stock sync завершён за ${Date.now() - startTime}мс: ` +
      `обновлено=${updated}, ошибок=${errors.length}`,
    );

    return result;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  /**
   * Имитирует upsert товара в БД.
   * TODO (Шаг 5): Заменить на реальный ProductRepository.upsert().
   */
  private async processProductUpsert(
    product: ErpProductItemDto,
    organizationId: string,
  ): Promise<'created' | 'updated' | 'skipped'> {
    // Имитация задержки БД
    await new Promise((r) => setTimeout(r, 2));

    // Имитация: 60% updated, 30% created, 10% skipped
    const rand = Math.random();
    if (rand < 0.6) return 'updated';
    if (rand < 0.9) return 'created';
    return 'skipped';
  }

  /**
   * Имитирует обновление остатков в БД.
   * TODO (Шаг 5): Заменить на реальный StockRepository.update().
   */
  private async processStockUpdate(
    item: ErpStockItemDto,
    organizationId: string,
  ): Promise<void> {
    // Имитация задержки БД
    await new Promise((r) => setTimeout(r, 1));
  }
}
