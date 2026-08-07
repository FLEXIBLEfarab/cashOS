import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MarketplaceService } from './marketplace.service';
import { SyncRequestDto } from './dto/sync-request.dto';
import { SyncStatusDto, SyncStartedResponseDto } from './dto/sync-status.dto';

@ApiTags('Marketplace')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/marketplace/sync
  // ──────────────────────────────────────────────────────────────────────────
  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Запустить синхронизацию с Kaspi Магазином',
    description:
      'Запускает асинхронную синхронизацию каталога, цен и/или остатков ' +
      'с Kaspi Магазином через Kaspi Seller API. ' +
      'Возвращает syncId для отслеживания прогресса.',
  })
  @ApiBody({ type: SyncRequestDto })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    type: SyncStartedResponseDto,
    description: '✅ Синхронизация запущена в фоне',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '❌ Синхронизация уже запущена. Дождитесь завершения.',
  })
  async startSync(@Body() dto: SyncRequestDto): Promise<SyncStartedResponseDto> {
    return this.marketplaceService.startSync(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GET /v1/marketplace/status
  // ──────────────────────────────────────────────────────────────────────────
  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Статус и логи последней синхронизации',
    description:
      'Возвращает текущий статус, сводку результатов и последние 50 записей лога. ' +
      'Опрашивайте этот эндпоинт каждые 2–5 секунд для отслеживания прогресса.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SyncStatusDto,
    description: 'Статус синхронизации',
  })
  getStatus(): SyncStatusDto {
    return this.marketplaceService.getStatus();
  }
}
