import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, Length, Min, Max } from 'class-validator';

export class CreateTaxDto {
  @ApiProperty({ description: 'Название налога', example: 'НДС 20%' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Ставка налога %', example: 20 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  rate: number;

  @ApiPropertyOptional({ description: 'Налог включён в цену', default: true })
  @IsOptional()
  @IsBoolean()
  is_included?: boolean = true;

  @ApiPropertyOptional({ description: 'Активен', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
