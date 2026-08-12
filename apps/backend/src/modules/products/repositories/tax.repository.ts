import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tax } from '../entities/tax.entity';
import { TaxFilterDto } from '../dto/tax/tax-filter.dto';

@Injectable()
export class TaxRepository {
  constructor(
    @InjectRepository(Tax)
    private readonly repo: Repository<Tax>,
  ) {}

  async findAll(filter: TaxFilterDto): Promise<{ data: Tax[]; total: number }> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc', search, is_active } = filter;

    const qb = this.repo.createQueryBuilder('tax')
      .where('tax.deleted_at IS NULL');

    if (search) {
      qb.andWhere('tax.name ILIKE :search', { search: `%${search}%` });
    }
    if (is_active !== undefined) {
      qb.andWhere('tax.is_active = :is_active', { is_active });
    }

    qb.orderBy(`tax.${sort_by}`, sort_order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Tax | null> {
    return this.repo.findOne({ where: { id, deleted_at: IsNull() } });
  }

  async findByName(name: string): Promise<Tax | null> {
    return this.repo.findOne({ where: { name, deleted_at: IsNull() } });
  }

  async create(entity: Partial<Tax>): Promise<Tax> {
    const tax = this.repo.create(entity);
    return this.repo.save(tax);
  }

  async update(id: string, entity: Partial<Tax>): Promise<Tax> {
    await this.repo.update({ id }, entity);
    return this.findOne(id) as Promise<Tax>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }
}
