import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BarcodeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  is_primary: boolean;

  @ApiProperty()
  created_at: Date;
}

class ProductImageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  alt_text: string | null;

  @ApiProperty()
  sort_order: number;

  @ApiProperty()
  is_main: boolean;
}

class PriceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  value: number;

  @ApiPropertyOptional()
  branch_id: string | null;

  @ApiPropertyOptional()
  valid_from: Date | null;

  @ApiPropertyOptional()
  valid_until: Date | null;

  @ApiProperty()
  is_active: boolean;
}

class StockInfoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  branch_id: string;

  @ApiPropertyOptional()
  warehouse_id: string | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  reserved_quantity: number;

  @ApiProperty()
  min_quantity: number;
}

class CategoryShortResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

class BrandShortResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

class UnitShortResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

class TaxShortResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  rate: number;
}

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  category: CategoryShortResponseDto | null;

  @ApiPropertyOptional()
  brand: BrandShortResponseDto | null;

  @ApiPropertyOptional()
  unit: UnitShortResponseDto | null;

  @ApiPropertyOptional()
  tax: TaxShortResponseDto | null;

  @ApiProperty()
  purchase_price: number;

  @ApiPropertyOptional()
  weight: number | null;

  @ApiPropertyOptional()
  weight_unit: string | null;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty({ type: [BarcodeResponseDto] })
  barcodes: BarcodeResponseDto[];

  @ApiProperty({ type: [ProductImageResponseDto] })
  images: ProductImageResponseDto[];

  @ApiProperty({ type: [PriceResponseDto] })
  prices: PriceResponseDto[];

  @ApiProperty({ type: [StockInfoResponseDto] })
  stock_info: StockInfoResponseDto[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
