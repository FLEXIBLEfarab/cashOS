import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { PosModule } from './modules/pos/pos.module';

@Module({
  imports: [
    // ─── Config ──────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // ─── Database ─────────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
        ssl:
          config.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // ─── Feature Modules ──────────────────────────────────────────────────────
    AuthModule,
    PosModule,
  ],
})
export class AppModule {}
