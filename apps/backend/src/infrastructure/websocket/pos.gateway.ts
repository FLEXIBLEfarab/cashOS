import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * PosGateway — WebSocket шлюз для real-time взаимодействия
 * с кассовыми терминалами и менеджерскими панелями.
 *
 * Namespace: `/pos`
 * Комнаты: `shift:{shiftId}` — терминал подключается к комнате своей смены
 *
 * Исходящие события:
 * - `shift.opened`    — смена открыта
 * - `shift.closed`    — смена закрыта
 * - `sale.created`    — продажа проведена (чек)
 * - `sale.refunded`   — возврат оформлен
 * - `cash.in`         — внесение наличных
 * - `cash.out`        — выемка наличных
 * - `payment.status`  — статус платёжной операции (Kaspi, QR)
 * - `sync.status`     — статус синхронизации с Kaspi Магазином
 */
@WebSocketGateway({
  namespace: 'pos',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})
export class PosGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(PosGateway.name);

  afterInit(_server: Server): void {
    this.logger.log('🔌 PosGateway инициализирован (namespace: /pos)');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`🟢 Клиент подключён: socketId=${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`🔴 Клиент отключился: socketId=${client.id}`);
  }

  // ─── Входящие события (от терминала) ──────────────────────────────────────

  /**
   * Терминал подписывается на события своей смены.
   * Сообщение: { shiftId: "uuid" }
   */
  @SubscribeMessage('terminal.join')
  handleJoinShift(
    @MessageBody() data: { shiftId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `shift:${data.shiftId}`;
    void client.join(room);
    this.logger.log(
      `📱 socketId=${client.id} вошёл в комнату: ${room}`,
    );
    client.emit('terminal.joined', { room, status: 'ok' });
  }

  /**
   * Терминал отписывается от событий смены.
   * Сообщение: { shiftId: "uuid" }
   */
  @SubscribeMessage('terminal.leave')
  handleLeaveShift(
    @MessageBody() data: { shiftId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `shift:${data.shiftId}`;
    void client.leave(room);
    this.logger.log(
      `📱 socketId=${client.id} покинул комнату: ${room}`,
    );
  }

  /**
   * Ping для проверки живости соединения.
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // ─── Исходящие события (от сервера к терминалу) ───────────────────────────

  /**
   * Транслирует событие всем клиентам в комнате смены.
   */
  broadcastToShift(shiftId: string, event: string, data: unknown): void {
    const room = `shift:${shiftId}`;
    this.server.to(room).emit(event, {
      ...((data as object) ?? {}),
      _meta: { broadcastedAt: new Date().toISOString() },
    });
    this.logger.debug(`📡 Broadcast [${event}] → комната ${room}`);
  }

  /**
   * Отправляет статус платежа конкретному терминалу (по socketId).
   * Используется для обновления статуса Kaspi Pay / QR в реальном времени.
   */
  sendPaymentStatus(
    socketId: string,
    status: 'pending' | 'approved' | 'declined' | 'timeout',
    details: Record<string, unknown>,
  ): void {
    this.server.to(socketId).emit('payment.status', {
      status,
      details,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(
      `💳 Статус платежа [${status}] → socketId=${socketId}`,
    );
  }

  /**
   * Рассылает статус синхронизации с Kaspi всем подключённым менеджерам.
   */
  broadcastSyncStatus(status: Record<string, unknown>): void {
    this.server.emit('sync.status', {
      ...status,
      timestamp: new Date().toISOString(),
    });
  }
}
