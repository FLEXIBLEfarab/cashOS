import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { OrdersService, Order, OrderItem } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() body: { table: number; items: OrderItem[]; comment?: string }): Order {
    return this.ordersService.create(body);
  }

  @Get()
  findAll(): Order[] {
    return this.ordersService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Order {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'new' | 'progress' | 'ready' | 'completed'
  ): Order {
    return this.ordersService.updateStatus(id, status);
  }
}
