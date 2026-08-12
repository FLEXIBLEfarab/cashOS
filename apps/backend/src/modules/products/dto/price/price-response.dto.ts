import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PriceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  product_id: string;

  @ApiPropertyOptional()
  branch_id: string | null;

  @ApiProperty()
  value: number;

  @ApiPropertyOptional()
  valid_from: Date | null;

  @ApiPropertyOptional()
  valid_until: Date | null;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
