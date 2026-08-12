import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CategoryShortDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  image_url: string | null;

  @ApiProperty()
  is_active: boolean;

  @ApiPropertyOptional()
  parent: CategoryShortDto | null;

  @ApiProperty({ type: [CategoryShortDto] })
  children: CategoryShortDto[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
