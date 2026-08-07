import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { OfdService } from './services/ofd.service';
import { RabbitMqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { WebsocketModule } from '../../infrastructure/websocket/websocket.module';

@Module({
  imports: [RabbitMqModule, WebsocketModule],
  controllers: [PosController],
  providers: [PosService, OfdService],
  exports: [PosService],
})
export class PosModule {}
