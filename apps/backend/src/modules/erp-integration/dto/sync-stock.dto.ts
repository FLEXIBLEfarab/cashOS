import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  Min,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ErpSource } from './sync-products.dto';

/**
 * Остаток одного товара на одном складе из 1С/SAP.
 */
export class ErpStockItemDto {
  @ApiProperty({
    example: 'ONEC-PROD-00001',
    description: 'Внешний ID товара в 1С/SAP',
  })
  @IsString()
  @IsNotEmpty({ message: 'externalProductId обязателен' })
  externalProductId: string;

  @ApiProperty({
    example: 'ONEC-WH-001',
    description: 'Внешний ID склада в 1С/SAP',
  })
  @IsString()
  @IsNotEmpty({ message: 'warehouseExternalId обязателен' })
  warehouseExternalId: string;

  @ApiProperty({
    example: 250,
    description: 'Фактический остаток (в единицах измерения товара)',
    minimum: 0,
  })
  @IsNumber({}, { message: 'quantity должно быть числом' })
  @Min(0, { message: 'Остаток не может быть отрицательным' })
  quantity: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Зарезервированный остаток (под активные заказы)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reservedQuantity?: number;

  @ApiProperty({
    example: '2026-08-05T06:00:00.000Z',
    description: 'Дата/время изменения остатка в 1С (ISO 8601)',
  })
  @IsISO8601({ strict: true }, { message: 'updatedAt должен быть в формате ISO 8601' })
  updatedAt: string;
}

/**
 * DTO для приёма остатков из 1С/SAP.
 */
export class SyncStockDto {
  @ApiProperty({
    enum: ErpSource,
    example: ErpSource.ONEC,
    description: 'Источник данных',
  })
  @IsEnum(ErpSource, { message: 'Укажите корректный источник данных' })
  source: ErpSource;

  @ApiProperty({
    example: 'org-uuid-1234',
    description: 'UUID организации в системе Четка',
  })
  @IsUUID('4', { message: 'organizationId должен быть UUID v4' })
  organizationId: string;

  @ApiPropertyOptional({
    example: 'ONEC-WH-001',
    description: 'Внешний ID конкретного склада (если нужна частичная синхронизация)',
  })
  @IsOptional()
  @IsString()
  filterByWarehouseId?: string;

  @ApiProperty({
    type: [ErpStockItemDto],
    description: 'Список остатков для обновления (до 5000 позиций за один запрос)',
  })
  @IsArray({ message: 'items должен быть массивом' })
  @ArrayMinSize(1, { message: 'Список остатков не может быть пустым' })
  @ValidateNested({ each: true })
  @Type(() => ErpStockItemDto)
  items: ErpStockItemDto[];
}
