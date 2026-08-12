import { ApiProperty } from '@nestjs/swagger';

export class TaxResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  is_included: boolean;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
