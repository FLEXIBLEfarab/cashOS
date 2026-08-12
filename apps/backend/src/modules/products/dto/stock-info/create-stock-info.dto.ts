import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class CreateStockInfoDto {
  @ApiProperty({ description: 'ID товара' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'ID филиала' })
  @IsUUID()
  branch_id: string;

  @ApiPropertyOptional({ description: 'ID склада' })
  @IsOptional()
  @IsUUID()
  warehouse_id?: string;

  @ApiPropertyOptional({ description: 'Количество', default: 0 })
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

  @ApiPropertyOptional({ description: 'Активна', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
