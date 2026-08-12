import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class ProductFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Поиск по названию или SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Фильтр по категории' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Фильтр по бренду' })
  @IsOptional()
  @IsUUID()
  brand_id?: string;

  @ApiPropertyOptional({ description: 'Фильтр по активности' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
