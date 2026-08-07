import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SyncScope } from './sync-request.dto';

export enum SyncStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

export class SyncLogEntryDto {
  @ApiProperty({ example: '2026-08-05T10:30:01.000Z' })
  timestamp: string;

  @ApiProperty({ enum: ['info', 'warn', 'error'], example: 'info' })
  level: 'info' | 'warn' | 'error';

  @ApiProperty({ example: 'Обработан товар SKU-12345' })
  message: string;

  @ApiPropertyOptional({ example: 'SKU-12345' })
  sku?: string;
}

export class SyncResultSummaryDto {
  @ApiProperty({ example: 250, description: 'Всего товаров обработано' })
  totalProcessed: number;

  @ApiProperty({ example: 248, description: 'Успешно синхронизировано' })
  successCount: number;

  @ApiProperty({ example: 2, description: 'Ошибок' })
  failedCount: number;

  @ApiProperty({ example: 15, description: 'Пропущено (не изменились)' })
  skippedCount: number;

  @ApiProperty({ example: 5230, description: 'Время выполнения (мс)' })
  durationMs: number;
}

export class SyncStatusDto {
  @ApiProperty({ example: 'sync-uuid-1234', description: 'UUID текущей или последней синхронизации' })
  syncId: string;

  @ApiProperty({ enum: SyncStatus, example: SyncStatus.COMPLETED })
  status: SyncStatus;

  @ApiProperty({ enum: SyncScope, example: SyncScope.ALL })
  scope: SyncScope;

  @ApiPropertyOptional({ example: '2026-08-05T10:00:00.000Z', nullable: true })
  startedAt: string | null;

  @ApiPropertyOptional({ example: '2026-08-05T10:01:30.000Z', nullable: true })
  completedAt: string | null;

  @ApiPropertyOptional({ type: SyncResultSummaryDto, nullable: true })
  result: SyncResultSummaryDto | null;

  @ApiProperty({ type: [SyncLogEntryDto], description: 'Последние 50 записей лога' })
  logs: SyncLogEntryDto[];

  @ApiPropertyOptional({ example: '2026-08-05T10:01:30.000Z', nullable: true, description: 'Время последней успешной синхронизации' })
  lastSuccessfulSyncAt: string | null;
}

export class SyncStartedResponseDto {
  @ApiProperty({ example: 'sync-uuid-1234' })
  syncId: string;

  @ApiProperty({ enum: SyncStatus, example: SyncStatus.RUNNING })
  status: SyncStatus;

  @ApiProperty({ example: '2026-08-05T10:00:00.000Z' })
  startedAt: string;

  @ApiProperty({ example: 'Синхронизация запущена. Используйте GET /v1/marketplace/status для отслеживания.' })
  message: string;
}
