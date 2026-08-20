import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// ─── Бизнес-модули ────────────────────────────────────────────────────────────
import { AuthModule } from './modules/auth/auth.module';
import { PosModule } from './modules/pos/pos.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { ErpIntegrationModule } from './modules/erp-integration/erp-integration.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';

// ─── Инфраструктурные модули ──────────────────────────────────────────────────
import { RabbitMqModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { WebsocketModule } from './infrastructure/websocket/websocket.module';

@Module({
  imports: [
    // ─── Глобальная конфигурация (.env) ─────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      expandVariables: true,
    }),

    // ─── База данных (TypeORM + PostgreSQL) ───────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'chetka'),
        password: config.get<string>('DB_PASSWORD', 'chetka_secret'),
        database: config.get<string>('DB_NAME', 'chetka_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
        retryAttempts: 5,
        retryDelay: 3000,
        ssl:
          config.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),

    // ─── Инфраструктура (Global) ─────────────────────────────────────────────
    RabbitMqModule,   // @Global() — доступен во всех модулях
    RedisModule,      // @Global() — доступен во всех модулях
    WebsocketModule,  // PosGateway для real-time событий

    // ─── Бизнес-модули ───────────────────────────────────────────────────────
    AuthModule,
    PosModule,
    MarketplaceModule,
    ErpIntegrationModule,
    ProductsModule,   // Модуль товаров (Developer 2): Product, Category, Brand, Unit, Tax, Barcode, Price, StockInfo
    OrdersModule,     // Модуль заказов для нового HTML фронтенда
  ],
})
export class AppModule {}
