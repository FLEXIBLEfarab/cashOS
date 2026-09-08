import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { RabbitMqProducerService } from '../../infrastructure/rabbitmq/rabbitmq.service';

export interface OrderItem {
  name: string;
  qty: number;
  price?: number;
}

export interface Order {
  id: string; // uuid
  number: number; // sequential display number (e.g. 1, 2, 3...)
  table: number;
  time: string; // HH:MM
  status: 'new' | 'progress' | 'ready' | 'completed';
  items: OrderItem[];
  comment?: string;
  total: number;
  createdAt: string;
  sentTime?: string;
  readyTime?: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    private readonly dataSource: DataSource,
    private readonly rabbitMqProducer: RabbitMqProducerService,
  ) {}

  private toOrderDto(order: OrderEntity): Order {
    return {
      id: order.id,
      number: order.number,
      table: order.table,
      time: order.time,
      status: order.status as any,
      items: (order.items || []).map((i) => ({
        name: i.name,
        qty: i.qty,
        price: Number(i.price),
      })),
      comment: order.comment,
      total: Number(order.total),
      createdAt: order.createdAt
        ? order.createdAt.toISOString()
        : new Date().toISOString(),
    };
  }

  async create(dto: {
    table: number;
    items: OrderItem[];
    comment?: string;
    branchId?: string;
  }): Promise<Order> {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // calculate total
    const total = dto.items.reduce((sum, item) => {
      const price = item.price ?? 1500;
      return sum + price * item.qty;
    }, 0);

    const count = await this.orderRepo.count();
    const number = count + 1;

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const tableNumber =
        typeof dto.table === 'number'
          ? dto.table
          : parseInt(String(dto.table).replace(/\D/g, ''), 10) || 1;

      const orderEntity = manager.create(OrderEntity, {
        number,
        table: tableNumber,
        time,
        status: OrderStatus.NEW,
        comment: dto.comment,
        total,
        branchId: dto.branchId,
      });

      const order = await manager.save(OrderEntity, orderEntity);

      const itemsEntities = dto.items.map((item) =>
        manager.create(OrderItemEntity, {
          orderId: order.id,
          name: item.name,
          qty: item.qty,
          price: item.price ?? 1500,
        }),
      );

      order.items = await manager.save(OrderItemEntity, itemsEntities);
      return order;
    });

    // Публикация события в RabbitMQ
    try {
      await this.rabbitMqProducer.publish('order.created', {
        orderId: savedOrder.id,
        number: savedOrder.number,
        table: savedOrder.table,
        total: savedOrder.total,
        itemsCount: savedOrder.items.length,
        createdAt: savedOrder.createdAt.toISOString(),
      });
    } catch (e) {
      this.logger.warn(`Failed to publish order.created event: ${e.message}`);
    }

    return this.toOrderDto(savedOrder);
  }

  async findAll(): Promise<Order[]> {
    const list = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
    });
    return list.map((o) => this.toOrderDto(o));
  }

  async findOne(id: string): Promise<Order> {
    let order = await this.orderRepo.findOne({
      where: { id },
    });

    if (!order && !isNaN(Number(id))) {
      order = await this.orderRepo.findOne({
        where: { number: Number(id) },
      });
    }

    if (!order) {
      throw new NotFoundException(`Заказ ID "${id}" не найден`);
    }

    return this.toOrderDto(order);
  }

  async updateStatus(
    id: string,
    status: 'new' | 'progress' | 'ready' | 'completed',
  ): Promise<Order> {
    let order = await this.orderRepo.findOne({ where: { id } });

    if (!order && !isNaN(Number(id))) {
      order = await this.orderRepo.findOne({ where: { number: Number(id) } });
    }

    if (!order) {
      throw new NotFoundException(`Заказ ID "${id}" не найден`);
    }

    order.status = status as OrderStatus;
    const updated = await this.orderRepo.save(order);

    // Публикация события в RabbitMQ
    try {
      await this.rabbitMqProducer.publish('order.status_changed', {
        orderId: updated.id,
        number: updated.number,
        table: updated.table,
        status: updated.status,
      });

      if (status === 'completed') {
        await this.rabbitMqProducer.publish('sale.created', {
          saleId: updated.id,
          amount: Number(updated.total),
          paymentMethod: 'CARD',
          items: updated.items.map((i) => ({
            name: i.name,
            qty: i.qty,
            price: Number(i.price),
          })),
        });
      }
    } catch (e) {
      this.logger.warn(`Failed to publish order event: ${e.message}`);
    }

    return this.toOrderDto(updated);
  }

  async getStats() {
    const list = await this.findAll();
    const busyTables = new Set(
      list.filter((o) => o.status !== 'completed').map((o) => o.table),
    ).size;

    const completed = list.filter((o) => o.status === 'completed');
    const revenue = completed.reduce((sum, o) => sum + o.total, 86400);

    return {
      busyTables,
      totalOrdersToday: list.length,
      todayRevenue: revenue,
    };
  }
}
