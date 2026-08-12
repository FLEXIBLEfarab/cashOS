import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class CategoryFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Поиск по названию' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Фильтр по родительской категории' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({ description: 'Фильтр по активности' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
