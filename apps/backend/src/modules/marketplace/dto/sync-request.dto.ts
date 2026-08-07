import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

/**
 * Область синхронизации с Kaspi Магазином.
 */
export enum SyncScope {
  /** Только каталог товаров (названия, описания, фото) */
  CATALOG = 'catalog',
  /** Только цены */
  PRICES = 'prices',
  /** Только остатки */
  STOCK = 'stock',
  /** Полная синхронизация (каталог + цены + остатки) */
  ALL = 'all',
}

export class SyncRequestDto {
  @ApiProperty({
    enum: SyncScope,
    enumName: 'SyncScope',
    example: SyncScope.ALL,
    description: 'Область синхронизации с Kaspi Магазином',
  })
  @IsEnum(SyncScope, { message: 'Укажите корректную область синхронизации' })
  scope: SyncScope;

  @ApiPropertyOptional({
    example: 'warehouse-uuid-1234',
    description: 'UUID склада для синхронизации остатков (опционально, по умолчанию — все склады)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'warehouseId должен быть UUID v4' })
  warehouseId?: string;

  @ApiPropertyOptional({
    example: 'category-uuid-1234',
    description: 'UUID категории для частичной синхронизации каталога',
  })
  @IsOptional()
  @IsUUID('4', { message: 'categoryId должен быть UUID v4' })
  categoryId?: string;
}
