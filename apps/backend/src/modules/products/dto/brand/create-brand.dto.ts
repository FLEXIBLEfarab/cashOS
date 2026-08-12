import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ description: 'Название бренда', example: 'Coca-Cola' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Описание' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL логотипа' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Активен', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
