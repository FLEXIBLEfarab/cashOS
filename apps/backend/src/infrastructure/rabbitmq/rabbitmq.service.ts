import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import {
  RABBITMQ_EXCHANGE,
  RabbitMqPayload,
} from './events/pos.events';

/**
 * RabbitMqProducerService — публикует события из NestJS в RabbitMQ.
 *
 * Exchange: `chetka.events` (topic)
 * Routing keys: `sale.created`, `stock.updated`, `shift.closed`, etc.
 *
 * Устойчив к недоступности брокера:
 * - При старте логирует ошибку, но не падает
 * - При публикации логирует ошибку и продолжает работу
 */
@Injectable()
export class RabbitMqProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqProducerService.name);

  private connection: amqplib.ChannelModel | null = null;
  private channel: amqplib.Channel | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Публикует событие в RabbitMQ exchange.
   * При недоступности брокера — логирует и продолжает (graceful degradation).
   */
  async publish(routingKey: string, payload: RabbitMqPayload): Promise<void> {
    if (!this.isConnected || !this.channel) {
      this.logger.warn(
        `⚠️ RabbitMQ недоступен. Событие ${routingKey} не отправлено. ` +
        `Payload: ${JSON.stringify(payload)}`,
      );
      return;
    }

    try {
      const message = Buffer.from(
        JSON.stringify({
          routingKey,
          payload,
          timestamp: new Date().toISOString(),
          version: '1.0',
        }),
      );

      const published = this.channel.publish(
        RABBITMQ_EXCHANGE,
        routingKey,
        message,
        {
          persistent: true,
          contentType: 'application/json',
          appId: 'chetka-backend',
        },
      );

      if (published) {
        this.logger.debug(`📤 Событие опубликовано: [${routingKey}]`);
      } else {
        this.logger.warn(`⚠️ Channel buffer full для события [${routingKey}]`);
      }
    } catch (error) {
      this.logger.error(
        `❌ Ошибка публикации [${routingKey}]: ${(error as Error).message}`,
      );
      // Попытка переподключения в фоне
      this.isConnected = false;
      void this.reconnect();
    }
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private async connect(): Promise<void> {
    const url = this.configService.get<string>('RABBITMQ_URL');

    if (!url) {
      this.logger.warn(
        '⚠️ RABBITMQ_URL не задан. Публикация событий отключена.',
      );
      return;
    }

    try {
      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();

      // Объявляем topic exchange (идемпотентно)
      await this.channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', {
        durable: true,
      });

      this.isConnected = true;
      this.logger.log(
        `✅ RabbitMQ подключён. Exchange: ${RABBITMQ_EXCHANGE} (topic)`,
      );

      // Обрабатываем ошибки соединения
      this.connection.on('error', (err: Error) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ соединение закрыто. Переподключение...');
        this.isConnected = false;
        void this.reconnect();
      });
    } catch (error) {
      this.logger.warn(
        `⚠️ Не удалось подключиться к RabbitMQ: ${(error as Error).message}. ` +
        `Сервис работает без очереди событий.`,
      );
    }
  }

  private async reconnect(): Promise<void> {
    // Пауза перед переподключением
    await new Promise((r) => setTimeout(r, 5000));

    if (!this.isConnected) {
      this.logger.log('🔄 Попытка переподключения к RabbitMQ...');
      await this.connect();
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('RabbitMQ соединение корректно закрыто');
    } catch {
      // Игнорируем ошибки при завершении
    }
  }
}
