import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class PriceFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Фильтр по товару' })
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @ApiPropertyOptional({ description: 'Фильтр по филиалу' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ description: 'Фильтр по активности' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
