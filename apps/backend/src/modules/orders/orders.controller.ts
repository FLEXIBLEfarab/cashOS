import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService, Order, OrderItem } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Создать заказ ресторана/кафе' })
  @ApiResponse({ status: 201, description: 'Заказ успешно создан' })
  async create(
    @Body() body: { table: number; items: OrderItem[]; comment?: string; branchId?: string },
  ): Promise<Order> {
    return this.ordersService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех заказов' })
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику по заказам и столам' })
  async getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детальную информацию о заказе' })
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Обновить статус заказа' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'new' | 'progress' | 'ready' | 'completed',
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, status);
  }
}
