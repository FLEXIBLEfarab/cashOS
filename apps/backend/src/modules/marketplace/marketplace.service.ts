import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { KaspiSyncService } from './services/kaspi-sync.service';
import { SyncRequestDto } from './dto/sync-request.dto';
import {
  SyncStatus,
  SyncStatusDto,
  SyncStartedResponseDto,
} from './dto/sync-status.dto';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  /** Состояние последней/текущей синхронизации. */
  private currentSync: SyncStatusDto = {
    syncId: '',
    status: SyncStatus.IDLE,
    scope: 'all' as never,
    startedAt: null,
    completedAt: null,
    result: null,
    logs: [],
    lastSuccessfulSyncAt: null,
  };

  constructor(private readonly kaspiSyncService: KaspiSyncService) {}

  /**
   * Запускает синхронизацию с Kaspi Магазином в фоне.
   * Если синхронизация уже идёт — возвращает 409 Conflict.
   */
  async startSync(dto: SyncRequestDto): Promise<SyncStartedResponseDto> {
    if (this.currentSync.status === SyncStatus.RUNNING) {
      throw new ConflictException(
        `Синхронизация уже запущена (syncId: ${this.currentSync.syncId}). ` +
        `Дождитесь завершения или проверьте статус через GET /v1/marketplace/status.`,
      );
    }

    const syncId = uuidv4();
    const startedAt = new Date().toISOString();

    this.currentSync = {
      syncId,
      status: SyncStatus.RUNNING,
      scope: dto.scope,
      startedAt,
      completedAt: null,
      result: null,
      logs: [],
      lastSuccessfulSyncAt: this.currentSync.lastSuccessfulSyncAt,
    };

    this.logger.log(`🔄 Синхронизация запущена: syncId=${syncId}, scope=${dto.scope}`);

    // Запускаем синхронизацию асинхронно (не блокируем HTTP-ответ)
    void this.runSyncInBackground(syncId, dto);

    return {
      syncId,
      status: SyncStatus.RUNNING,
      startedAt,
      message:
        'Синхронизация запущена. ' +
        'Используйте GET /v1/marketplace/status для отслеживания прогресса.',
    };
  }

  /**
   * Возвращает статус и логи последней синхронизации.
   */
  getStatus(): SyncStatusDto {
    return this.currentSync;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private async runSyncInBackground(
    syncId: string,
    dto: SyncRequestDto,
  ): Promise<void> {
    try {
      const { result, logs } = await this.kaspiSyncService.sync(
        dto.scope,
        dto.warehouseId,
      );

      const completedAt = new Date().toISOString();
      const hasFailed = result.failedCount > 0;

      this.currentSync = {
        ...this.currentSync,
        status: hasFailed ? SyncStatus.PARTIAL : SyncStatus.COMPLETED,
        completedAt,
        result,
        logs: logs.slice(-50), // Храним последние 50 записей лога
        lastSuccessfulSyncAt: hasFailed
          ? this.currentSync.lastSuccessfulSyncAt
          : completedAt,
      };

      this.logger.log(
        `✅ Синхронизация завершена: syncId=${syncId}, ` +
        `статус=${this.currentSync.status}, ` +
        `обработано=${result.totalProcessed}`,
      );
    } catch (error) {
      this.currentSync = {
        ...this.currentSync,
        status: SyncStatus.FAILED,
        completedAt: new Date().toISOString(),
        logs: [
          ...this.currentSync.logs,
          {
            timestamp: new Date().toISOString(),
            level: 'error',
            message: `Критическая ошибка синхронизации: ${(error as Error).message}`,
          },
        ],
      };

      this.logger.error(
        `❌ Синхронизация провалилась: syncId=${syncId}, ` +
        `ошибка=${(error as Error).message}`,
      );
    }
  }
}
