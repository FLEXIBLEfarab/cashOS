import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MarketplaceService } from './marketplace.service';
import { KaspiPayService } from './services/kaspi-pay.service';
import { SyncRequestDto } from './dto/sync-request.dto';
import { SyncStatusDto, SyncStartedResponseDto } from './dto/sync-status.dto';
import {
  CreateKaspiPaymentDto,
  KaspiPaymentResponseDto,
  KaspiPaymentStatusResponseDto,
  RefundKaspiPaymentDto,
} from './dto/kaspi-payment.dto';

@ApiTags('Marketplace & Kaspi')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly kaspiPayService: KaspiPayService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  Kaspi Магазин: POST /v1/marketplace/sync
  // ──────────────────────────────────────────────────────────────────────────
  @Post('sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Запустить синхронизацию с Kaspi Магазином',
    description: 'Запускает асинхронную синхронизацию каталога, цен и/или остатков.',
  })
  @ApiBody({ type: SyncRequestDto })
  @ApiResponse({ status: HttpStatus.ACCEPTED, type: SyncStartedResponseDto })
  async startSync(@Body() dto: SyncRequestDto): Promise<SyncStartedResponseDto> {
    return this.marketplaceService.startSync(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Kaspi Магазин: GET /v1/marketplace/status
  // ──────────────────────────────────────────────────────────────────────────
  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Статус и логи последней синхронизации с Kaspi' })
  @ApiResponse({ status: HttpStatus.OK, type: SyncStatusDto })
  getStatus(): SyncStatusDto {
    return this.marketplaceService.getStatus();
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Kaspi Pay: POST /v1/marketplace/kaspi/pay/create
  // ──────────────────────────────────────────────────────────────────────────
  @Post('kaspi/pay/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создать Kaspi Pay QR-платёж',
    description: 'Генерирует QR-код и deepLink для оплаты покупателем через приложение Kaspi.',
  })
  @ApiBody({ type: CreateKaspiPaymentDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: KaspiPaymentResponseDto })
  async createKaspiPay(@Body() dto: CreateKaspiPaymentDto): Promise<KaspiPaymentResponseDto> {
    return this.kaspiPayService.createPayment(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Kaspi Pay: GET /v1/marketplace/kaspi/pay/:id/status
  // ──────────────────────────────────────────────────────────────────────────
  @Get('kaspi/pay/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверить статус Kaspi Pay платежа' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: HttpStatus.OK, type: KaspiPaymentStatusResponseDto })
  async getKaspiPayStatus(@Param('id') id: string): Promise<KaspiPaymentStatusResponseDto> {
    return this.kaspiPayService.getPaymentStatus(id);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Kaspi Pay: POST /v1/marketplace/kaspi/pay/refund
  // ──────────────────────────────────────────────────────────────────────────
  @Post('kaspi/pay/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Оформить возврат Kaspi Pay платежа' })
  @ApiBody({ type: RefundKaspiPaymentDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Возврат успешно инициирован' })
  async refundKaspiPay(@Body() dto: RefundKaspiPaymentDto) {
    return this.kaspiPayService.refundPayment(dto);
  }
}
