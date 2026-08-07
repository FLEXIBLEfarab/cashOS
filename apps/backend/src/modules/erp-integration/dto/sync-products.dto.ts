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
  Max,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Источник ERP-данных.
 */
export enum ErpSource {
  ONEC = 'onec',
  SAP = 'sap',
  CUSTOM = 'custom',
}

/**
 * Единицы измерения (как в казахстанском 1С).
 */
export enum UnitOfMeasure {
  PCS = 'шт',
  KG = 'кг',
  LITER = 'л',
  METER = 'м',
  BOX = 'кор',
  PACK = 'уп',
}

/**
 * Данные одного товара из 1С/SAP.
 */
export class ErpProductItemDto {
  @ApiProperty({
    example: 'ONEC-PROD-00001',
    description: 'ID товара в 1С/SAP (внешний идентификатор)',
  })
  @IsString()
  @IsNotEmpty({ message: 'externalId обязателен' })
  externalId: string;

  @ApiProperty({ example: 'Молоко «Фудмастер» 3.2% 1л', description: 'Наименование товара' })
  @IsString()
  @IsNotEmpty({ message: 'Наименование обязательно' })
  name: string;

  @ApiProperty({ example: 'SKU-00001', description: 'Артикул' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({ example: '4600000000001', description: 'Штрихкод (EAN-13)' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 450, description: 'Цена продажи (₸)', minimum: 0 })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 300, description: 'Закупочная цена (₸)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiProperty({ example: 12, description: 'Ставка НДС (%)', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate: number;

  @ApiProperty({
    enum: UnitOfMeasure,
    example: UnitOfMeasure.PCS,
    description: 'Единица измерения',
  })
  @IsEnum(UnitOfMeasure, { message: 'Укажите корректную единицу измерения' })
  unit: UnitOfMeasure;

  @ApiPropertyOptional({ example: 'Молочная продукция', description: 'Категория в 1С' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Фудмастер', description: 'Производитель / бренд' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: '2026-08-05T00:00:00.000Z', description: 'Дата последнего изменения в 1С (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  updatedAt?: string;
}

/**
 * DTO для приёма номенклатуры и цен из 1С/SAP.
 */
export class SyncProductsDto {
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

  @ApiProperty({
    type: [ErpProductItemDto],
    description: 'Список товаров для синхронизации (до 1000 за один запрос)',
  })
  @IsArray({ message: 'products должен быть массивом' })
  @ArrayMinSize(1, { message: 'Список товаров не может быть пустым' })
  @ValidateNested({ each: true })
  @Type(() => ErpProductItemDto)
  products: ErpProductItemDto[];
}
