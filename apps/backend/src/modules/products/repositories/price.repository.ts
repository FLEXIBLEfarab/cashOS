import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Price } from '../entities/price.entity';
import { PriceFilterDto } from '../dto/price/price-filter.dto';

@Injectable()
export class PriceRepository {
  constructor(
    @InjectRepository(Price)
    private readonly repo: Repository<Price>,
  ) {}

  async findAll(filter: PriceFilterDto): Promise<{ data: Price[]; total: number }> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc', product_id, branch_id, is_active } = filter;

    const qb = this.repo.createQueryBuilder('price')
      .leftJoinAndSelect('price.branch', 'branch')
      .where('price.deleted_at IS NULL');

    if (product_id) {
      qb.andWhere('price.product_id = :product_id', { product_id });
    }
    if (branch_id) {
      qb.andWhere('price.branch_id = :branch_id', { branch_id });
    }
    if (is_active !== undefined) {
      qb.andWhere('price.is_active = :is_active', { is_active });
    }

    qb.orderBy(`price.${sort_by}`, sort_order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Price | null> {
    return this.repo.findOne({ where: { id, deleted_at: IsNull() }, relations: ['branch'] });
  }

  async findByProductId(product_id: string): Promise<Price[]> {
    return this.repo.find({ where: { product_id, deleted_at: IsNull() }, relations: ['branch'] });
  }

  async create(entity: Partial<Price>): Promise<Price> {
    const price = this.repo.create(entity);
    return this.repo.save(price);
  }

  async createMany(entities: Partial<Price>[]): Promise<Price[]> {
    const prices = this.repo.create(entities);
    return this.repo.save(prices);
  }

  async update(id: string, entity: Partial<Price>): Promise<Price> {
    await this.repo.update({ id }, entity);
    return this.findOne(id) as Promise<Price>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }

  async softDeleteByProductId(product_id: string): Promise<void> {
    await this.repo.softDelete({ product_id });
  }
}
