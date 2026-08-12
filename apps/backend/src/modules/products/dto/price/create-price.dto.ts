import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber, IsBoolean, IsString, Min } from 'class-validator';

export class CreatePriceDto {
  @ApiProperty({ description: 'ID товара' })
  @IsUUID()
  product_id: string;

  @ApiPropertyOptional({ description: 'ID филиала' })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiProperty({ description: 'Цена', example: 999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Действует с', example: '2026-01-01' })
  @IsOptional()
  @IsString()
  valid_from?: string;

  @ApiPropertyOptional({ description: 'Действует до', example: '2026-12-31' })
  @IsOptional()
  @IsString()
  valid_until?: string;

  @ApiPropertyOptional({ description: 'Активна', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
