/**
 * Типы событий RabbitMQ для проекта «Четка».
 * Используются в качестве routing keys в exchange `chetka.events`.
 */

export const RABBITMQ_EXCHANGE = 'chetka.events';

export const RABBITMQ_ROUTING_KEYS = {
  SALE_CREATED: 'sale.created',
  STOCK_UPDATED: 'stock.updated',
  SHIFT_CLOSED: 'shift.closed',
  REFUND_CREATED: 'refund.created',
  SYNC_REQUESTED: 'sync.requested',
} as const;

export type RabbitMqRoutingKey =
  (typeof RABBITMQ_ROUTING_KEYS)[keyof typeof RABBITMQ_ROUTING_KEYS];

// ─── Event Payload Types ───────────────────────────────────────────────────────

export interface SaleCreatedPayload {
  saleId: string;
  shiftId: string;
  cashierId: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface StockUpdatedPayload {
  productId: string;
  warehouseId: string;
  quantity: number;
  previousQuantity: number;
  updatedAt: string;
}

export interface ShiftClosedPayload {
  shiftId: string;
  terminalId: string;
  cashierId: string;
  totalSalesAmount: number;
  discrepancy: number;
  closedAt: string;
}

export interface RefundCreatedPayload {
  refundId: string;
  originalSaleId: string;
  shiftId: string;
  refundAmount: number;
  createdAt: string;
}

export interface SyncRequestedPayload {
  syncId: string;
  source: string;
  scope: string;
  requestedAt: string;
}

export type RabbitMqPayload =
  | SaleCreatedPayload
  | StockUpdatedPayload
  | ShiftClosedPayload
  | RefundCreatedPayload
  | SyncRequestedPayload;
