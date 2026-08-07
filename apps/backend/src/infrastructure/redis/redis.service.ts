import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * RedisService — кэширование сессий, текущих остатков и токен-блэклиста.
 *
 * Ключи:
 * - `session:{userId}`          — данные JWT-сессии (TTL 15 мин)
 * - `stock:{productId}:{wh}`    — остаток товара на складе (TTL 5 мин)
 * - `blacklist:{jti}`           — отозванный JWT (TTL = оставшийся срок токена)
 * - `shift:{shiftId}`           — кэш текущей смены (TTL = длительность смены)
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  // ─── Generic ───────────────────────────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.warn(`Redis GET error [${key}]: ${(error as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.warn(`Redis SET error [${key}]: ${(error as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(`Redis DEL error [${key}]: ${(error as Error).message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  // ─── Сессии ────────────────────────────────────────────────────────────────

  /**
   * Сохраняет данные сессии пользователя (TTL 15 минут = срок access токена).
   */
  async cacheSession(userId: string, data: Record<string, unknown>, ttlSeconds = 900): Promise<void> {
    await this.set(`session:${userId}`, JSON.stringify(data), ttlSeconds);
  }

  async getSession(userId: string): Promise<Record<string, unknown> | null> {
    const raw = await this.get(`session:${userId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async deleteSession(userId: string): Promise<void> {
    await this.del(`session:${userId}`);
  }

  // ─── Блэклист токенов ─────────────────────────────────────────────────────

  /**
   * Добавляет токен в blacklist при logout.
   * TTL = оставшееся время жизни токена.
   */
  async blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    await this.set(`blacklist:${jti}`, '1', ttlSeconds);
    this.logger.debug(`🚫 Токен в blacklist: jti=${jti}`);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    return this.exists(`blacklist:${jti}`);
  }

  // ─── Кэш остатков ─────────────────────────────────────────────────────────

  /**
   * Кэшируем остаток товара на складе (TTL 5 минут).
   */
  async cacheStock(productId: string, warehouseId: string, quantity: number): Promise<void> {
    await this.set(`stock:${productId}:${warehouseId}`, String(quantity), 300);
  }

  async getCachedStock(productId: string, warehouseId: string): Promise<number | null> {
    const raw = await this.get(`stock:${productId}:${warehouseId}`);
    if (raw === null) return null;
    const num = Number(raw);
    return isNaN(num) ? null : num;
  }

  async invalidateStock(productId: string, warehouseId: string): Promise<void> {
    await this.del(`stock:${productId}:${warehouseId}`);
  }

  // ─── Состояние подключения ─────────────────────────────────────────────────

  get connected(): boolean {
    return this.isConnected;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private async connect(): Promise<void> {
    const url = this.configService.get<string>('REDIS_URL');

    if (!url) {
      this.logger.warn('⚠️ REDIS_URL не задан. Redis кэширование отключено.');
      return;
    }

    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
        retryStrategy: () => null, // отключаем повторные бесконечные попытки в консоли
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('✅ Redis подключён');
      });

      this.client.on('error', () => {
        this.isConnected = false;
      });

      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      this.logger.warn(
        `⚠️ Redis недоступен: ${(error as Error).message}. Сервис работает без кэша.`,
      );
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.client?.quit();
    } catch {
      // Игнорируем ошибки при завершении
    }
  }
}
