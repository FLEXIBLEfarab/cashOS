import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CreateSaleDto, PaymentMethod, SplitPaymentItemDto } from './dto/create-sale.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
import { CashInDto, CashOutDto } from './dto/cash-in-out.dto';
import {
  ShiftResponseDto,
  CloseShiftResponseDto,
  SaleResponseDto,
  SaleItemResponseDto,
  RefundResponseDto,
  CashInOutResponseDto,
  ShiftReportDto,
  PaymentMethodTotalsDto,
  FiscalReceiptDto,
} from './dto/pos-response.dto';
import { OfdService } from './services/ofd.service';
import { RabbitMqProducerService } from '../../infrastructure/rabbitmq/rabbitmq.service';

// ─── Internal State (in-memory) ───────────────────────────────────────────────

/**
 * Внутреннее состояние смены с расширенными данными для отчётности.
 * TODO (Шаг 4): Заменить на TypeORM Entity — ShiftEntity.
 */
interface ShiftState {
  shiftId: string;
  terminalId: string;
  cashierId: string;
  openedAt: string;
  closedAt: string | null;
  status: 'open' | 'closed';
  openingCash: number;
  closingCash: number | null;
  note: string | null;
  // Агрегаты продаж
  totalSalesCount: number;
  totalSalesAmount: number;
  refundsCount: number;
  refundsAmount: number;
  // Итоги по методам оплаты
  cashTotal: number;
  cardTotal: number;
  kaspiPayTotal: number;
  qrTotal: number;
  // Движение наличных
  cashInTotal: number;
  cashOutTotal: number;
  cashInOutOperations: CashInOutResponseDto[];
}

/**
 * Преобразует внутренний ShiftState в ShiftResponseDto.
 */
function toShiftResponse(state: ShiftState): ShiftResponseDto {
  return {
    shiftId: state.shiftId,
    terminalId: state.terminalId,
    cashierId: state.cashierId,
    openedAt: state.openedAt,
    closedAt: state.closedAt,
    status: state.status,
    openingCash: state.openingCash,
    closingCash: state.closingCash,
    totalSalesAmount: state.totalSalesAmount,
    totalSalesCount: state.totalSalesCount,
    cashInTotal: state.cashInTotal,
    cashOutTotal: state.cashOutTotal,
    note: state.note,
  };
}

// ─── PosService ────────────────────────────────────────────────────────────────

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name);

  /**
   * In-memory хранилища.
   * TODO (Шаг 4): Заменить на TypeORM ShiftRepository и SaleRepository.
   */
  private readonly shiftStates = new Map<string, ShiftState>();
  private readonly sales = new Map<string, SaleResponseDto>();

  constructor(
    private readonly ofdService: OfdService,
    private readonly rabbitMqProducer: RabbitMqProducerService,
  ) {}

  // ─── Смены (Shifts) ──────────────────────────────────────────────────────────

  /**
   * Открыть новую кассовую смену.
   */
  async openShift(
    dto: OpenShiftDto,
    cashierId: string,
  ): Promise<ShiftResponseDto> {
    const existingOpen = Array.from(this.shiftStates.values()).find(
      (s) => s.terminalId === dto.terminalId && s.status === 'open',
    );

    if (existingOpen) {
      throw new BadRequestException(
        `На терминале ${dto.terminalId} уже открыта смена (shiftId: ${existingOpen.shiftId}). ` +
        `Закройте её перед открытием новой.`,
      );
    }

    const state: ShiftState = {
      shiftId: uuidv4(),
      terminalId: dto.terminalId,
      cashierId,
      openedAt: new Date().toISOString(),
      closedAt: null,
      status: 'open',
      openingCash: dto.openingCash,
      closingCash: null,
      note: dto.note ?? null,
      totalSalesCount: 0,
      totalSalesAmount: 0,
      refundsCount: 0,
      refundsAmount: 0,
      cashTotal: 0,
      cardTotal: 0,
      kaspiPayTotal: 0,
      qrTotal: 0,
      cashInTotal: 0,
      cashOutTotal: 0,
      cashInOutOperations: [],
    };

    this.shiftStates.set(state.shiftId, state);

    this.logger.log(
      `📂 Смена открыта: shiftId=${state.shiftId}, terminal=${dto.terminalId}, кассир=${cashierId}`,
    );

    return toShiftResponse(state);
  }

  /**
   * Закрыть кассовую смену.
   * Публикует событие shift.closed в RabbitMQ.
   */
  async closeShift(
    dto: CloseShiftDto,
    cashierId: string,
  ): Promise<CloseShiftResponseDto> {
    const state = this.getShiftStateOrThrow(dto.shiftId);

    if (state.status === 'closed') {
      throw new BadRequestException(`Смена ${dto.shiftId} уже закрыта`);
    }

    const closedAt = new Date().toISOString();
    // Ожидаемые наличные = начало + внесения − выемки + наличные продажи
    const expectedCash =
      state.openingCash +
      state.cashInTotal -
      state.cashOutTotal +
      state.cashTotal;
    const discrepancy = dto.closingCash - expectedCash;

    Object.assign(state, {
      closedAt,
      status: 'closed' as const,
      closingCash: dto.closingCash,
      note: dto.note ?? state.note,
    });

    // Публикуем событие в RabbitMQ
    await this.rabbitMqProducer.publish('shift.closed', {
      shiftId: state.shiftId,
      terminalId: state.terminalId,
      cashierId,
      totalSalesAmount: state.totalSalesAmount,
      discrepancy,
      closedAt,
    });

    this.logger.log(
      `📁 Смена закрыта: shiftId=${dto.shiftId}, расхождение=${discrepancy} ₸`,
    );

    return {
      ...toShiftResponse(state),
      closedAt,
      status: 'closed',
      closingCash: dto.closingCash,
      expectedCash,
      discrepancy,
    };
  }

  // ─── Отчёт по смене ──────────────────────────────────────────────────────────

  /**
   * Сформировать X-отчёт (без закрытия) или Z-отчёт (для закрытой смены).
   */
  async getShiftReport(shiftId: string): Promise<ShiftReportDto> {
    const state = this.getShiftStateOrThrow(shiftId);

    const reportType: 'X' | 'Z' = state.status === 'open' ? 'X' : 'Z';

    const netAmount = state.totalSalesAmount - state.refundsAmount;

    const expectedCashInDrawer =
      state.openingCash +
      state.cashInTotal -
      state.cashOutTotal +
      state.cashTotal;

    const paymentTotals: PaymentMethodTotalsDto = {
      cash: state.cashTotal,
      card: state.cardTotal,
      kaspiPay: state.kaspiPayTotal,
      qr: state.qrTotal,
    };

    const report: ShiftReportDto = {
      reportType,
      generatedAt: new Date().toISOString(),
      shiftId: state.shiftId,
      terminalId: state.terminalId,
      cashierId: state.cashierId,
      openedAt: state.openedAt,
      closedAt: state.closedAt,
      status: state.status,
      totalSalesCount: state.totalSalesCount,
      totalSalesAmount: state.totalSalesAmount,
      totalRefundsCount: state.refundsCount,
      totalRefundsAmount: state.refundsAmount,
      netAmount,
      paymentTotals,
      openingCash: state.openingCash,
      cashInTotal: state.cashInTotal,
      cashOutTotal: state.cashOutTotal,
      expectedCashInDrawer,
      closingCash: state.closingCash,
      discrepancy:
        state.closingCash !== null
          ? state.closingCash - expectedCashInDrawer
          : null,
    };

    this.logger.log(
      `📊 ${reportType}-отчёт сформирован: shiftId=${shiftId}, чистая выручка=${netAmount} ₸`,
    );

    return report;
  }

  // ─── Внесение / Выемка наличных ───────────────────────────────────────────────

  /**
   * Внесение наличных в кассу (cash-in).
   */
  async cashIn(
    shiftId: string,
    dto: CashInDto,
    cashierId: string,
  ): Promise<CashInOutResponseDto> {
    const state = this.getOpenShiftStateOrThrow(shiftId);

    const operation: CashInOutResponseDto = {
      operationId: uuidv4(),
      operationType: 'cash_in',
      shiftId,
      cashierId,
      amount: dto.amount,
      reason: dto.reason,
      createdAt: new Date().toISOString(),
    };

    state.cashInTotal += dto.amount;
    state.cashInOutOperations.push(operation);

    this.logger.log(
      `💵 Cash-In: ${dto.amount} ₸ в смену ${shiftId}. Причина: ${dto.reason}`,
    );

    return operation;
  }

  /**
   * Выемка (инкассация) наличных из кассы (cash-out).
   */
  async cashOut(
    shiftId: string,
    dto: CashOutDto,
    cashierId: string,
  ): Promise<CashInOutResponseDto> {
    const state = this.getOpenShiftStateOrThrow(shiftId);

    const currentCash =
      state.openingCash + state.cashInTotal - state.cashOutTotal + state.cashTotal;

    if (dto.amount > currentCash) {
      throw new BadRequestException(
        `Недостаточно наличных для выемки. В кассе: ${currentCash} ₸, запрошено: ${dto.amount} ₸`,
      );
    }

    const operation: CashInOutResponseDto = {
      operationId: uuidv4(),
      operationType: 'cash_out',
      shiftId,
      cashierId,
      amount: dto.amount,
      reason: dto.reason,
      createdAt: new Date().toISOString(),
    };

    state.cashOutTotal += dto.amount;
    state.cashInOutOperations.push(operation);

    this.logger.log(
      `🏦 Cash-Out (инкассация): ${dto.amount} ₸ из смены ${shiftId}. Причина: ${dto.reason}`,
    );

    return operation;
  }

  // ─── Продажи (Sales) ──────────────────────────────────────────────────────────

  /**
   * Провести продажу и зафискализировать чек.
   */
  async createSale(
    dto: CreateSaleDto,
    cashierId: string,
  ): Promise<SaleResponseDto> {
    const state = this.getOpenShiftStateOrThrow(dto.shiftId);

    // Расчёт суммы
    const subtotal = dto.items.reduce((acc, item) => {
      const lineTotal = item.unitPrice * item.quantity - (item.discount ?? 0);
      if (lineTotal < 0) {
        throw new BadRequestException(
          `Сумма по позиции товара ${item.productId} не может быть отрицательной`,
        );
      }
      return acc + lineTotal;
    }, 0);

    const totalDiscount = dto.totalDiscount ?? 0;
    const totalAmount = subtotal - totalDiscount;

    if (totalAmount < 0) {
      throw new BadRequestException('Итоговая сумма чека не может быть отрицательной');
    }

    // Валидация методов оплаты
    let changeAmount = 0;
    let splitPayments: SplitPaymentItemDto[] | null = null;

    switch (dto.paymentMethod) {
      case PaymentMethod.CASH:
        if (dto.cashAmount !== undefined && dto.cashAmount < totalAmount) {
          throw new BadRequestException(
            `Недостаточно наличных. Передано: ${dto.cashAmount} ₸, к оплате: ${totalAmount} ₸`,
          );
        }
        changeAmount =
          dto.cashAmount !== undefined ? Math.round(dto.cashAmount - totalAmount) : 0;
        break;

      case PaymentMethod.SPLIT: {
        if (!dto.splitPayments || dto.splitPayments.length < 2) {
          throw new BadRequestException(
            'Для SPLIT оплаты обязательно указать минимум 2 метода в splitPayments',
          );
        }
        const splitTotal = dto.splitPayments.reduce((s, p) => s + p.amount, 0);
        if (Math.abs(splitTotal - totalAmount) > 0.01) {
          throw new BadRequestException(
            `Сумма в splitPayments (${splitTotal} ₸) не совпадает с totalAmount (${totalAmount} ₸)`,
          );
        }
        splitPayments = dto.splitPayments;
        break;
      }

      default:
        // CARD, KASPI_PAY, QR — валидация на стороне платёжного шлюза
        break;
    }

    const saleItems: SaleItemResponseDto[] = dto.items.map((item) => ({
      saleItemId: uuidv4(),
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount ?? 0,
      totalPrice: item.unitPrice * item.quantity - (item.discount ?? 0),
    }));

    // Временно создаём объект продажи без фискального чека для OFD вызова
    const saleId = uuidv4();
    const receiptNumber = `RCP-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const partialSale: SaleResponseDto = {
      saleId,
      shiftId: dto.shiftId,
      cashierId,
      customerId: dto.customerId ?? null,
      receiptNumber,
      items: saleItems,
      subtotal,
      totalDiscount,
      totalAmount,
      paymentMethod: dto.paymentMethod,
      splitPayments,
      cashAmount: dto.cashAmount ?? null,
      changeAmount,
      status: 'completed',
      fiscalReceipt: {} as FiscalReceiptDto, // будет заполнено ниже
      createdAt,
    };

    // Фискализация через ОФД
    const fiscalReceipt = await this.ofdService.registerSaleReceipt(partialSale);
    const sale: SaleResponseDto = { ...partialSale, fiscalReceipt };

    this.sales.set(saleId, sale);

    // Обновляем агрегаты смены
    this.updateShiftSaleTotals(state, dto.paymentMethod, totalAmount, splitPayments);

    // Публикуем событие в RabbitMQ
    await this.rabbitMqProducer.publish('sale.created', {
      saleId: sale.saleId,
      shiftId: sale.shiftId,
      cashierId,
      totalAmount,
      paymentMethod: dto.paymentMethod,
      createdAt,
    });

    this.logger.log(
      `🧾 Продажа: saleId=${saleId}, сумма=${totalAmount} ₸, ` +
      `оплата=${dto.paymentMethod}, фискальный=${fiscalReceipt.fiscalReceiptNumber}`,
    );

    return sale;
  }

  /**
   * Оформить возврат по продаже (полный или частичный).
   */
  async refundSale(
    dto: RefundSaleDto,
    cashierId: string,
  ): Promise<RefundResponseDto> {
    const originalSale = this.sales.get(dto.saleId);
    if (!originalSale) {
      throw new NotFoundException(`Продажа saleId=${dto.saleId} не найдена`);
    }

    const state = this.getOpenShiftStateOrThrow(dto.shiftId);

    let refundAmount: number;

    if (!dto.items || dto.items.length === 0) {
      refundAmount = originalSale.totalAmount;
    } else {
      refundAmount = dto.items.reduce((acc, refundItem) => {
        const saleItem = originalSale.items.find(
          (i) => i.saleItemId === refundItem.saleItemId,
        );

        if (!saleItem) {
          throw new NotFoundException(
            `Позиция saleItemId=${refundItem.saleItemId} не найдена в чеке ${dto.saleId}`,
          );
        }

        if (refundItem.quantity > saleItem.quantity) {
          throw new BadRequestException(
            `Количество для возврата (${refundItem.quantity}) по товару ${saleItem.productId} ` +
            `превышает количество в чеке (${saleItem.quantity})`,
          );
        }

        const effectiveUnitPrice = saleItem.totalPrice / saleItem.quantity;
        return acc + effectiveUnitPrice * refundItem.quantity;
      }, 0);
    }

    // Фискализация возврата
    const fiscalReceipt = await this.ofdService.registerRefundReceipt(
      uuidv4(),
      originalSale.fiscalReceipt.fiscalReceiptNumber,
      refundAmount,
    );

    const refund: RefundResponseDto = {
      refundId: uuidv4(),
      originalSaleId: dto.saleId,
      shiftId: dto.shiftId,
      cashierId,
      refundReceiptNumber: `RFD-${Date.now()}`,
      items: dto.items ?? [],
      refundAmount: Math.round(refundAmount),
      reason: dto.reason,
      isFullRefund: !dto.items || dto.items.length === 0,
      fiscalReceipt,
      createdAt: new Date().toISOString(),
    };

    state.refundsCount += 1;
    state.refundsAmount += Math.round(refundAmount);

    this.logger.log(
      `↩️ Возврат: refundId=${refund.refundId}, сумма=${refund.refundAmount} ₸, ` +
      `фискальный=${fiscalReceipt.fiscalReceiptNumber}`,
    );

    return refund;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private getShiftStateOrThrow(shiftId: string): ShiftState {
    const state = this.shiftStates.get(shiftId);
    if (!state) {
      throw new NotFoundException(`Смена shiftId=${shiftId} не найдена`);
    }
    return state;
  }

  private getOpenShiftStateOrThrow(shiftId: string): ShiftState {
    const state = this.getShiftStateOrThrow(shiftId);
    if (state.status === 'closed') {
      throw new BadRequestException(`Смена ${shiftId} закрыта. Операция невозможна.`);
    }
    return state;
  }

  /**
   * Обновляет агрегаты по методам оплаты в состоянии смены.
   */
  private updateShiftSaleTotals(
    state: ShiftState,
    method: PaymentMethod,
    totalAmount: number,
    splitPayments: SplitPaymentItemDto[] | null,
  ): void {
    state.totalSalesCount += 1;
    state.totalSalesAmount += totalAmount;

    if (method === PaymentMethod.SPLIT && splitPayments) {
      for (const sp of splitPayments) {
        this.addToMethodTotal(state, sp.method as PaymentMethod, sp.amount);
      }
    } else {
      this.addToMethodTotal(state, method, totalAmount);
    }
  }

  private addToMethodTotal(
    state: ShiftState,
    method: PaymentMethod,
    amount: number,
  ): void {
    switch (method) {
      case PaymentMethod.CASH:
        state.cashTotal += amount;
        break;
      case PaymentMethod.CARD:
        state.cardTotal += amount;
        break;
      case PaymentMethod.KASPI_PAY:
        state.kaspiPayTotal += amount;
        break;
      case PaymentMethod.QR:
        state.qrTotal += amount;
        break;
    }
  }
}
