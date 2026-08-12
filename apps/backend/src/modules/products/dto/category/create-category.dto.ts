import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Название категории', example: 'Молочные продукты' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Описание' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL изображения' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  image_url?: string;

  @ApiPropertyOptional({ description: 'ID родительской категории' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({ description: 'Активна', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
