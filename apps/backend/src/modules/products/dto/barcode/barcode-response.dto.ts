import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BarcodeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  product_id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  is_primary: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
