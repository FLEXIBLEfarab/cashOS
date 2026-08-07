import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ErpIntegrationService, ErpSyncProductsResult, ErpSyncStockResult } from './erp-integration.service';
import { SyncProductsDto } from './dto/sync-products.dto';
import { SyncStockDto } from './dto/sync-stock.dto';

@ApiTags('ERP Integration')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('erp')
export class ErpIntegrationController {
  constructor(private readonly erpService: ErpIntegrationService) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/erp/sync/products
  // ──────────────────────────────────────────────────────────────────────────
  @Post('sync/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Принять номенклатуру и цены из 1С/SAP',
    description:
      'Принимает список товаров из ERP-системы (1С Управление торговлей или SAP). ' +
      'Выполняет upsert (create/update) по полю externalId. ' +
      'Максимум 1000 позиций за запрос.',
  })
  @ApiBody({ type: SyncProductsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Номенклатура обработана. Возвращает сводку: создано/обновлено/пропущено.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Ошибка валидации данных',
  })
  async syncProducts(@Body() dto: SyncProductsDto): Promise<ErpSyncProductsResult> {
    return this.erpService.syncProducts(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/erp/sync/stock
  // ──────────────────────────────────────────────────────────────────────────
  @Post('sync/stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Принять остатки товаров из 1С/SAP',
    description:
      'Принимает обновлённые остатки от 1С/SAP по каждому складу. ' +
      'Обновляет данные в базе и инвалидирует Redis кэш остатков. ' +
      'Публикует событие stock.updated в RabbitMQ. ' +
      'Максимум 5000 позиций за запрос.',
  })
  @ApiBody({ type: SyncStockDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Остатки обновлены. Возвращает сводку обновлений.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Ошибка валидации данных',
  })
  async syncStock(@Body() dto: SyncStockDto): Promise<ErpSyncStockResult> {
    return this.erpService.syncStock(dto);
  }
}
