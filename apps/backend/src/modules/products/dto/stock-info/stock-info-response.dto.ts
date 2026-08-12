import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockInfoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  product_id: string;

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

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
