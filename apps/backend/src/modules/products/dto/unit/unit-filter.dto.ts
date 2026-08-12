import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class UnitFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Поиск по названию или коду' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Фильтр по активности' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
