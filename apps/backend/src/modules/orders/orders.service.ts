import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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
  private readonly orders = new Map<string, Order>();
  private orderCounter = 0;
  private todayRevenue = 86400; // default starting revenue for dashboard demo

  constructor() {
    // Populate some initial dummy orders so screen isn't blank on first boot
    this.seedDemoOrders();
  }

  private seedDemoOrders() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    this.create({
      table: 2,
      comment: 'Без сахара',
      items: [
        { name: 'Капучино', qty: 2, price: 1600 },
        { name: 'Латте', qty: 1, price: 1700 }
      ]
    });
    this.create({
      table: 7,
      items: [
        { name: 'Флэт Уайт', qty: 1, price: 1800 },
        { name: 'Круассан', qty: 1, price: 1400 }
      ]
    });
    
    const order3 = this.create({
      table: 5,
      items: [
        { name: 'Паста Карбонара', qty: 1, price: 3200 },
        { name: 'Лимонад', qty: 1, price: 1400 }
      ]
    });
    this.updateStatus(order3.id, 'progress');
  }

  create(dto: { table: number; items: OrderItem[]; comment?: string }): Order {
    this.orderCounter += 1;
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // calculate total
    const total = dto.items.reduce((sum, item) => {
      const price = item.price ?? 1500; // default price fallback
      return sum + (price * item.qty);
    }, 0);

    const order: Order = {
      id: uuidv4(),
      number: this.orderCounter,
      table: dto.table,
      time,
      status: 'new',
      items: dto.items.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price ?? 1500
      })),
      comment: dto.comment,
      total,
      createdAt: d.toISOString()
    };

    this.orders.set(order.id, order);
    return order;
  }

  findAll(): Order[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  findOne(id: string): Order {
    const order = this.orders.get(id);
    if (!order) {
      // Also try to find by short order sequential number for easy search
      const byNumber = Array.from(this.orders.values()).find(
        o => o.number === parseInt(id)
      );
      if (byNumber) return byNumber;
      throw new NotFoundException(`Заказ ID "${id}" не найден`);
    }
    return order;
  }

  updateStatus(id: string, status: 'new' | 'progress' | 'ready' | 'completed'): Order {
    const order = this.findOne(id);
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    order.status = status;
    if (status === 'progress') {
      order.sentTime = time;
    } else if (status === 'ready') {
      order.readyTime = time;
    } else if (status === 'completed') {
      this.todayRevenue += order.total;
    }

    this.orders.set(order.id, order);
    return order;
  }

  getStats() {
    const list = this.findAll();
    const busyTables = new Set(
      list.filter(o => o.status !== 'completed').map(o => o.table)
    ).size;

    return {
      busyTables,
      totalOrdersToday: list.length,
      todayRevenue: this.todayRevenue
    };
  }
}
