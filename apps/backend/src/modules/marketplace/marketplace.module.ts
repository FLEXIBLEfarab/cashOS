import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { KaspiSyncService } from './services/kaspi-sync.service';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, KaspiSyncService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
