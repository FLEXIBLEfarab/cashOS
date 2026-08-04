import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CreateSaleDto, PaymentMethod } from './dto/create-sale.dto';
import { RefundSaleDto } from './dto/refund-sale.dto';
import {
  ShiftResponseDto,
  CloseShiftResponseDto,
  SaleResponseDto,
  SaleItemResponseDto,
  RefundResponseDto,
} from './dto/pos-response.dto';

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name);

  /**
   * In-memory хранилища (временные).
   * TODO: Заменить на TypeORM Repositories в Шаге 4.
   */
  private readonly shifts = new Map<string, ShiftResponseDto>();
  private readonly sales = new Map<string, SaleResponseDto>();

  // ──────────────────────────────────────────────────────────────────────────
  //  Смены (Shifts)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Открыть новую кассовую смену.
   * Один терминал = одна открытая смена в моменте.
   */
  async openShift(
    dto: OpenShiftDto,
    cashierId: string,
  ): Promise<ShiftResponseDto> {
    // Проверяем: нет ли уже открытой смены на этом терминале
    const existingOpen = Array.from(this.shifts.values()).find(
      (s) => s.terminalId === dto.terminalId && s.status === 'open',
    );

    if (existingOpen) {
      throw new BadRequestException(
        `На терминале ${dto.terminalId} уже открыта смена (shiftId: ${existingOpen.shiftId}). Закройте её перед открытием новой.`,
      );
    }

    const shift: ShiftResponseDto = {
      shiftId: uuidv4(),
      terminalId: dto.terminalId,
      cashierId,
      openedAt: new Date().toISOString(),
      closedAt: null,
      status: 'open',
      openingCash: dto.openingCash,
      closingCash: null,
      totalSalesAmount: 0,
      totalSalesCount: 0,
      note: dto.note ?? null,
    };

    this.shifts.set(shift.shiftId, shift);

    this.logger.log(
      `📂 Смена открыта: shiftId=${shift.shiftId}, terminal=${dto.terminalId}, кассир=${cashierId}`,
    );

    return shift;
  }

  /**
   * Закрыть кассовую смену.
   * Подсчитывает расхождение между ожидаемой и фактической суммой наличных.
   */
  async closeShift(
    dto: CloseShiftDto,
    cashierId: string,
  ): Promise<CloseShiftResponseDto> {
    const shift = this.shifts.get(dto.shiftId);

    if (!shift) {
      throw new NotFoundException(
        `Смена с shiftId=${dto.shiftId} не найдена`,
      );
    }

    if (shift.status === 'closed') {
      throw new BadRequestException(
        `Смена ${dto.shiftId} уже закрыта`,
      );
    }

    // В реальной системе кассир может закрывать только свою смену
    // (или менеджер — любую). Оставляем проверку как TODO.
    // if (shift.cashierId !== cashierId) {
    //   throw new ForbiddenException('Вы не можете закрыть чужую смену');
    // }

    // Ожидаемая сумма = начальные наличные + все продажи наличными
    // TODO: В Шаге 4 учитывать только cash/mixed платежи
    const expectedCash = shift.openingCash + shift.totalSalesAmount;
    const discrepancy = dto.closingCash - expectedCash;

    const closedAt = new Date().toISOString();

    const closedShift: CloseShiftResponseDto = {
      ...shift,
      closedAt,
      status: 'closed',
      closingCash: dto.closingCash,
      note: dto.note ?? shift.note,
      expectedCash,
      discrepancy,
    };

    // Сохраняем закрытое состояние
    this.shifts.set(dto.shiftId, {
      ...shift,
      closedAt,
      status: 'closed',
      closingCash: dto.closingCash,
      note: dto.note ?? shift.note,
    });

    this.logger.log(
      `📁 Смена закрыта: shiftId=${dto.shiftId}, ` +
      `расхождение=${discrepancy} ₸, кассир=${cashierId}`,
    );

    return closedShift;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  Продажи (Sales)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Провести продажу (создать чек).
   */
  async createSale(
    dto: CreateSaleDto,
    cashierId: string,
  ): Promise<SaleResponseDto> {
    const shift = this.shifts.get(dto.shiftId);

    if (!shift) {
      throw new NotFoundException(
        `Смена с shiftId=${dto.shiftId} не найдена`,
      );
    }

    if (shift.status === 'closed') {
      throw new BadRequestException(
        'Невозможно провести продажу: смена закрыта',
      );
    }

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
      throw new BadRequestException(
        'Итоговая сумма чека не может быть отрицательной',
      );
    }

    // Валидация наличной оплаты
    if (
      dto.paymentMethod === PaymentMethod.CASH &&
      dto.cashAmount !== undefined &&
      dto.cashAmount < totalAmount
    ) {
      throw new BadRequestException(
        `Недостаточно наличных. Передано: ${dto.cashAmount} ₸, к оплате: ${totalAmount} ₸`,
      );
    }

    const changeAmount =
      dto.paymentMethod === PaymentMethod.CASH && dto.cashAmount !== undefined
        ? Math.round(dto.cashAmount - totalAmount)
        : 0;

    const saleItems: SaleItemResponseDto[] = dto.items.map((item) => ({
      saleItemId: uuidv4(),
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount ?? 0,
      totalPrice: item.unitPrice * item.quantity - (item.discount ?? 0),
    }));

    const sale: SaleResponseDto = {
      saleId: uuidv4(),
      shiftId: dto.shiftId,
      cashierId,
      customerId: dto.customerId ?? null,
      receiptNumber: `RCP-${Date.now()}`,
      items: saleItems,
      subtotal,
      totalDiscount,
      totalAmount,
      paymentMethod: dto.paymentMethod,
      cashAmount: dto.cashAmount ?? null,
      changeAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    this.sales.set(sale.saleId, sale);

    // Обновляем счётчики смены
    const currentShift = this.shifts.get(dto.shiftId)!;
    currentShift.totalSalesAmount += totalAmount;
    currentShift.totalSalesCount += 1;

    this.logger.log(
      `🧾 Продажа: saleId=${sale.saleId}, сумма=${totalAmount} ₸, ` +
      `способ оплаты=${dto.paymentMethod}, кассир=${cashierId}`,
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
      throw new NotFoundException(
        `Продажа с saleId=${dto.saleId} не найдена`,
      );
    }

    const shift = this.shifts.get(dto.shiftId);

    if (!shift) {
      throw new NotFoundException(
        `Смена с shiftId=${dto.shiftId} не найдена`,
      );
    }

    if (shift.status === 'closed') {
      throw new BadRequestException(
        'Невозможно оформить возврат: смена закрыта',
      );
    }

    let refundAmount: number;

    if (!dto.items || dto.items.length === 0) {
      // Полный возврат
      refundAmount = originalSale.totalAmount;
    } else {
      // Частичный возврат
      refundAmount = dto.items.reduce((acc, refundItem) => {
        const saleItem = originalSale.items.find(
          (i) => i.saleItemId === refundItem.saleItemId,
        );

        if (!saleItem) {
          throw new NotFoundException(
            `Позиция saleItemId=${refundItem.saleItemId} не найдена в чеке saleId=${dto.saleId}`,
          );
        }

        if (refundItem.quantity > saleItem.quantity) {
          throw new BadRequestException(
            `Количество для возврата (${refundItem.quantity}) по позиции ${saleItem.productId} ` +
            `превышает количество в чеке (${saleItem.quantity})`,
          );
        }

        // Пропорциональный расчёт с учётом скидки
        const effectiveUnitPrice =
          saleItem.totalPrice / saleItem.quantity;

        return acc + effectiveUnitPrice * refundItem.quantity;
      }, 0);
    }

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
      createdAt: new Date().toISOString(),
    };

    this.logger.log(
      `↩️ Возврат: refundId=${refund.refundId}, ` +
      `originalSaleId=${dto.saleId}, сумма=${refund.refundAmount} ₸, ` +
      `кассир=${cashierId}`,
    );

    return refund;
  }
}
