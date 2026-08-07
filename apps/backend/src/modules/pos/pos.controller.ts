import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PosService } from './pos.service';
import { PosGateway } from '../../infrastructure/websocket/pos.gateway';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
import { CashInDto, CashOutDto } from './dto/cash-in-out.dto';
import {
  ShiftResponseDto,
  CloseShiftResponseDto,
  SaleResponseDto,
  RefundResponseDto,
  CashInOutResponseDto,
  ShiftReportDto,
} from './dto/pos-response.dto';
import { UserPayloadDto } from '../auth/dto/auth-response.dto';

interface RequestWithUser extends Request {
  user: UserPayloadDto;
}

@ApiTags('POS')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('pos')
export class PosController {
  constructor(
    private readonly posService: PosService,
    private readonly posGateway: PosGateway,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/shifts/open
  // ──────────────────────────────────────────────────────────────────────────
  @Post('shifts/open')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Открыть кассовую смену' })
  @ApiBody({ type: OpenShiftDto })
  @ApiResponse({ status: 201, type: ShiftResponseDto, description: 'Смена открыта' })
  @ApiResponse({ status: 400, description: 'На терминале уже открыта смена' })
  async openShift(
    @Body() dto: OpenShiftDto,
    @Request() req: RequestWithUser,
  ): Promise<ShiftResponseDto> {
    const shift = await this.posService.openShift(dto, req.user.sub);
    this.posGateway.broadcastToShift(shift.shiftId, 'shift.opened', shift);
    return shift;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/shifts/close
  // ──────────────────────────────────────────────────────────────────────────
  @Post('shifts/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Закрыть кассовую смену', description: 'Рассчитывает расхождение наличных. Публикует событие shift.closed в RabbitMQ.' })
  @ApiBody({ type: CloseShiftDto })
  @ApiResponse({ status: 200, type: CloseShiftResponseDto, description: 'Смена закрыта с итогами' })
  @ApiResponse({ status: 404, description: 'Смена не найдена' })
  @ApiResponse({ status: 400, description: 'Смена уже закрыта' })
  async closeShift(
    @Body() dto: CloseShiftDto,
    @Request() req: RequestWithUser,
  ): Promise<CloseShiftResponseDto> {
    const result = await this.posService.closeShift(dto, req.user.sub);
    this.posGateway.broadcastToShift(result.shiftId, 'shift.closed', result);
    return result;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GET /v1/pos/shifts/:id/report
  // ──────────────────────────────────────────────────────────────────────────
  @Get('shifts/:id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Получить отчёт по смене (X/Z)',
    description:
      'X-отчёт — для открытой смены (без закрытия). ' +
      'Z-отчёт — для закрытой смены. ' +
      'Содержит суммы по методам оплаты, движение наличных, расхождения.',
  })
  @ApiParam({ name: 'id', description: 'UUID смены', example: 'shift-uuid-1234' })
  @ApiResponse({ status: 200, type: ShiftReportDto, description: 'X или Z отчёт по смене' })
  @ApiResponse({ status: 404, description: 'Смена не найдена' })
  async getShiftReport(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ShiftReportDto> {
    return this.posService.getShiftReport(id);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/shifts/:id/cash-in
  // ──────────────────────────────────────────────────────────────────────────
  @Post('shifts/:id/cash-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Внесение наличных в кассу (cash-in)',
    description: 'Используется для добавления разменной монеты или внесения наличных от менеджера.',
  })
  @ApiParam({ name: 'id', description: 'UUID смены' })
  @ApiBody({ type: CashInDto })
  @ApiResponse({ status: 201, type: CashInOutResponseDto, description: 'Операция внесения зарегистрирована' })
  @ApiResponse({ status: 400, description: 'Смена закрыта или ошибка валидации' })
  @ApiResponse({ status: 404, description: 'Смена не найдена' })
  async cashIn(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CashInDto,
    @Request() req: RequestWithUser,
  ): Promise<CashInOutResponseDto> {
    const result = await this.posService.cashIn(id, dto, req.user.sub);
    this.posGateway.broadcastToShift(id, 'cash.in', result);
    return result;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/shifts/:id/cash-out
  // ──────────────────────────────────────────────────────────────────────────
  @Post('shifts/:id/cash-out')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Выемка наличных из кассы (cash-out / инкассация)',
    description: 'Используется при плановой инкассации или изъятии наличных. Проверяет достаточность остатка.',
  })
  @ApiParam({ name: 'id', description: 'UUID смены' })
  @ApiBody({ type: CashOutDto })
  @ApiResponse({ status: 201, type: CashInOutResponseDto, description: 'Операция выемки зарегистрирована' })
  @ApiResponse({ status: 400, description: 'Недостаточно наличных, смена закрыта или ошибка валидации' })
  @ApiResponse({ status: 404, description: 'Смена не найдена' })
  async cashOut(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CashOutDto,
    @Request() req: RequestWithUser,
  ): Promise<CashInOutResponseDto> {
    const result = await this.posService.cashOut(id, dto, req.user.sub);
    this.posGateway.broadcastToShift(id, 'cash.out', result);
    return result;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/sales
  // ──────────────────────────────────────────────────────────────────────────
  @Post('sales')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Провести продажу',
    description:
      'Создаёт кассовый чек. Поддерживает: CASH, CARD, KASPI_PAY, QR, SPLIT. ' +
      'Автоматически фискализирует чек через ОФД.',
  })
  @ApiBody({ type: CreateSaleDto })
  @ApiResponse({ status: 201, type: SaleResponseDto, description: 'Продажа проведена, чек зафискализирован' })
  @ApiResponse({ status: 400, description: 'Смена закрыта, ошибка суммы SPLIT или нехватка наличных' })
  @ApiResponse({ status: 404, description: 'Смена не найдена' })
  @ApiResponse({ status: 503, description: 'ОФД временно недоступен' })
  async createSale(
    @Body() dto: CreateSaleDto,
    @Request() req: RequestWithUser,
  ): Promise<SaleResponseDto> {
    const sale = await this.posService.createSale(dto, req.user.sub);
    this.posGateway.broadcastToShift(sale.shiftId, 'sale.created', sale);
    return sale;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/sales/refund
  // ──────────────────────────────────────────────────────────────────────────
  @Post('sales/refund')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Оформить возврат по продаже',
    description: 'Полный или частичный возврат. Фискализирует чек возврата через ОФД.',
  })
  @ApiBody({ type: RefundSaleDto })
  @ApiResponse({ status: 201, type: RefundResponseDto, description: 'Возврат оформлен, чек зафискализирован' })
  @ApiResponse({ status: 400, description: 'Превышено количество для возврата или смена закрыта' })
  @ApiResponse({ status: 404, description: 'Продажа или смена не найдены' })
  async refundSale(
    @Body() dto: RefundSaleDto,
    @Request() req: RequestWithUser,
  ): Promise<RefundResponseDto> {
    const refund = await this.posService.refundSale(dto, req.user.sub);
    this.posGateway.broadcastToShift(refund.shiftId, 'sale.refunded', refund);
    return refund;
  }
}
