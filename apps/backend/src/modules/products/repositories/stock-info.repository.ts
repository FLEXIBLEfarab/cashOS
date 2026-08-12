import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockInfo } from '../entities/stock-info.entity';
import { StockInfoFilterDto } from '../dto/stock-info/stock-info-filter.dto';

@Injectable()
export class StockInfoRepository {
  constructor(
    @InjectRepository(StockInfo)
    private readonly repo: Repository<StockInfo>,
  ) {}

  async findAll(filter: StockInfoFilterDto): Promise<{ data: StockInfo[]; total: number }> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc', product_id, branch_id, warehouse_id, is_active } = filter;

    const qb = this.repo.createQueryBuilder('stock')
      .leftJoinAndSelect('stock.branch', 'branch')
      .leftJoinAndSelect('stock.warehouse', 'warehouse')
      .where('stock.deleted_at IS NULL');

    if (product_id) {
      qb.andWhere('stock.product_id = :product_id', { product_id });
    }
    if (branch_id) {
      qb.andWhere('stock.branch_id = :branch_id', { branch_id });
    }
    if (warehouse_id) {
      qb.andWhere('stock.warehouse_id = :warehouse_id', { warehouse_id });
    }
    if (is_active !== undefined) {
      qb.andWhere('stock.is_active = :is_active', { is_active });
    }

    qb.orderBy(`stock.${sort_by}`, sort_order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<StockInfo | null> {
    return this.repo.findOne({ where: { id, deleted_at: null }, relations: ['branch', 'warehouse'] });
  }

  async findByProductId(product_id: string): Promise<StockInfo[]> {
    return this.repo.find({ where: { product_id, deleted_at: null }, relations: ['branch', 'warehouse'] });
  }

  async create(entity: Partial<StockInfo>): Promise<StockInfo> {
    const stock = this.repo.create(entity);
    return this.repo.save(stock);
  }

  async createMany(entities: Partial<StockInfo>[]): Promise<StockInfo[]> {
    const stocks = this.repo.create(entities);
    return this.repo.save(stocks);
  }

  async update(id: string, entity: Partial<StockInfo>): Promise<StockInfo> {
    await this.repo.update({ id }, entity);
    return this.findOne(id) as Promise<StockInfo>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }

  async softDeleteByProductId(product_id: string): Promise<void> {
    await this.repo.softDelete({ product_id });
  }
}
