import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ description: 'Название единицы', example: 'Штука' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Код единицы', example: 'pcs' })
  @IsString()
  @Length(1, 20)
  code: string;

  @ApiPropertyOptional({ description: 'Аббревиатура', example: 'шт.' })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  abbreviation?: string;

  @ApiPropertyOptional({ description: 'Активна', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
