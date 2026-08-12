import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class BarcodeFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Поиск по коду' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Фильтр по товару' })
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @ApiPropertyOptional({ description: 'Только основные' })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
