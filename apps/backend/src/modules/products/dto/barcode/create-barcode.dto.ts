import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateBarcodeDto {
  @ApiProperty({ description: 'Код штрихкода', example: '4601234567890' })
  @IsString()
  @Length(1, 100)
  code: string;

  @ApiProperty({ description: 'ID товара' })
  @IsUUID()
  product_id: string;

  @ApiPropertyOptional({ description: 'Тип штрихкода', example: 'ean13', default: 'ean13' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  type?: string = 'ean13';

  @ApiPropertyOptional({ description: 'Основной штрихкод', default: true })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean = true;
}
