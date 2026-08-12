import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDecimal,
  Length,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateBarcodeDto {
  @ApiProperty({ description: 'Код штрихкода', example: '4601234567890' })
  @IsString()
  @Length(1, 100)
  code: string;

  @ApiPropertyOptional({ description: 'Тип штрихкода', example: 'ean13', default: 'ean13' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  type?: string = 'ean13';

  @ApiPropertyOptional({ description: 'Основной штрихкод', default: true })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean = true;
}

class CreateProductImageDto {
  @ApiProperty({ description: 'URL изображения', example: 'https://cdn.example.com/img.jpg' })
  @IsString()
  @Length(1, 500)
  url: string;

  @ApiPropertyOptional({ description: 'Alt текст' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  alt_text?: string;

  @ApiPropertyOptional({ description: 'Порядок сортировки', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number = 0;

  @ApiPropertyOptional({ description: 'Главное изображение', default: false })
  @IsOptional()
  @IsBoolean()
  is_main?: boolean = false;
}

class CreatePriceDto {
  @ApiPropertyOptional({ description: 'ID филиала', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiProperty({ description: 'Цена', example: 999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Действует с', example: '2026-01-01' })
  @IsOptional()
  @IsString()
  valid_from?: string;

  @ApiPropertyOptional({ description: 'Действует до', example: '2026-12-31' })
  @IsOptional()
  @IsString()
  valid_until?: string;
}

class CreateStockInfoDto {
  @ApiProperty({ description: 'ID филиала', example: 'uuid' })
  @IsUUID()
  branch_id: string;

  @ApiPropertyOptional({ description: 'ID склада', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  warehouse_id?: string;

  @ApiPropertyOptional({ description: 'Количество на остатке', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  quantity?: number = 0;

  @ApiPropertyOptional({ description: 'Зарезервировано', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  reserved_quantity?: number = 0;

  @ApiPropertyOptional({ description: 'Минимальный остаток', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  min_quantity?: number = 0;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Артикул', example: 'SKU-001' })
  @IsString()
  @Length(1, 100)
  sku: string;

  @ApiProperty({ description: 'Название товара', example: 'Молоко 3,2%' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Описание' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ID категории' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: 'ID бренда' })
  @IsOptional()
  @IsUUID()
  brand_id?: string;

  @ApiPropertyOptional({ description: 'ID единицы измерения' })
  @IsOptional()
  @IsUUID()
  unit_id?: string;

  @ApiPropertyOptional({ description: 'ID налога' })
  @IsOptional()
  @IsUUID()
  tax_id?: string;

  @ApiPropertyOptional({ description: 'Закупочная цена', example: 450.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchase_price?: number;

  @ApiPropertyOptional({ description: 'Вес', example: 1.000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Единица веса', example: 'kg' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  weight_unit?: string;

  @ApiPropertyOptional({ description: 'Активен', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiPropertyOptional({ description: 'Штрихкоды', type: [CreateBarcodeDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateBarcodeDto)
  barcodes?: CreateBarcodeDto[];

  @ApiPropertyOptional({ description: 'Изображения', type: [CreateProductImageDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];

  @ApiPropertyOptional({ description: 'Цены', type: [CreatePriceDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePriceDto)
  prices?: CreatePriceDto[];

  @ApiPropertyOptional({ description: 'Складские остатки', type: [CreateStockInfoDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateStockInfoDto)
  stock_info?: CreateStockInfoDto[];
}
