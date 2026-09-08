import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { OfdService } from './services/ofd.service';
import { RabbitMqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { WebsocketModule } from '../../infrastructure/websocket/websocket.module';
import { ShiftEntity } from './entities/shift.entity';
import { SaleEntity } from './entities/sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftEntity, SaleEntity]),
    RabbitMqModule,
    WebsocketModule,
  ],
  controllers: [PosController],
  providers: [PosService, OfdService],
  exports: [PosService, TypeOrmModule],
})
export class PosModule {}
