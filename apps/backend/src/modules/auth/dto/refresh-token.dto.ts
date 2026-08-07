import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIn0...',
    description: 'Refresh токен для обновления пары JWT токенов',
  })
  @IsString({ message: 'Refresh токен должен быть строкой' })
  @IsNotEmpty({ message: 'Refresh токен не может быть пустым' })
  refreshToken: string;
}
