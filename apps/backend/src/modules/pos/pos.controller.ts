import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PosService } from './pos.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
import {
  ShiftResponseDto,
  CloseShiftResponseDto,
  SaleResponseDto,
  RefundResponseDto,
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
  constructor(private readonly posService: PosService) {}

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/shifts/open
  // ──────────────────────────────────────────────────────────────────────────
  @Post('shifts/open')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Открыть кассовую смену',
    description:
      'Открывает новую смену на указанном терминале. ' +
      'На одном терминале может быть только одна открытая смена.',
  })
  @ApiBody({ type: OpenShiftDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Смена успешно открыта.',
    type: ShiftResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ На терминале уже открыта смена или ошибка валидации.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '❌ Не авторизован.',
  })
  async openShift(
    @Body() dto: OpenShiftDto,
    @Request() req: RequestWithUser,
  ): Promise<ShiftResponseDto> {
    return this.posService.openShift(dto, req.user.sub);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/shifts/close
  // ──────────────────────────────────────────────────────────────────────────
  @Post('shifts/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Закрыть кассовую смену',
    description:
      'Закрывает указанную смену. Рассчитывает расхождение между ' +
      'ожидаемой и фактической суммой наличных в кассе.',
  })
  @ApiBody({ type: CloseShiftDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Смена успешно закрыта. Возвращает итоги смены.',
    type: CloseShiftResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Смена не найдена.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Смена уже закрыта или ошибка валидации.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '❌ Не авторизован.',
  })
  async closeShift(
    @Body() dto: CloseShiftDto,
    @Request() req: RequestWithUser,
  ): Promise<CloseShiftResponseDto> {
    return this.posService.closeShift(dto, req.user.sub);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/sales
  // ──────────────────────────────────────────────────────────────────────────
  @Post('sales')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Провести продажу',
    description:
      'Создаёт кассовый чек в рамках открытой смены. ' +
      'Поддерживает оплату наличными, картой, QR (Kaspi) и смешанный способ.',
  })
  @ApiBody({ type: CreateSaleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Продажа успешно проведена. Возвращает данные чека.',
    type: SaleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      '❌ Смена закрыта, недостаточно наличных, или ошибка валидации.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Смена не найдена.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '❌ Не авторизован.',
  })
  async createSale(
    @Body() dto: CreateSaleDto,
    @Request() req: RequestWithUser,
  ): Promise<SaleResponseDto> {
    return this.posService.createSale(dto, req.user.sub);
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  POST /v1/pos/sales/refund
  // ──────────────────────────────────────────────────────────────────────────
  @Post('sales/refund')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Оформить возврат по продаже',
    description:
      'Создаёт чек возврата. Поддерживает полный возврат (весь чек) ' +
      'и частичный возврат (отдельные позиции и количества).',
  })
  @ApiBody({ type: RefundSaleDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Возврат успешно оформлен. Возвращает данные чека возврата.',
    type: RefundResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Продажа или смена не найдены.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      '❌ Смена закрыта, превышено количество для возврата, или ошибка валидации.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '❌ Не авторизован.',
  })
  async refundSale(
    @Body() dto: RefundSaleDto,
    @Request() req: RequestWithUser,
  ): Promise<RefundResponseDto> {
    return this.posService.refundSale(dto, req.user.sub);
  }
}
