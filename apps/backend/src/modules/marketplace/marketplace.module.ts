import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { KaspiSyncService } from './services/kaspi-sync.service';
import { KaspiPayService } from './services/kaspi-pay.service';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, KaspiSyncService, KaspiPayService],
  exports: [MarketplaceService, KaspiPayService],
})
export class MarketplaceModule {}
