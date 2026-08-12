import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { BrandFilterDto } from '../dto/brand/brand-filter.dto';

@Injectable()
export class BrandRepository {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  async findAll(filter: BrandFilterDto): Promise<{ data: Brand[]; total: number }> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc', search, is_active } = filter;

    const qb = this.repo.createQueryBuilder('brand')
      .where('brand.deleted_at IS NULL');

    if (search) {
      qb.andWhere('brand.name ILIKE :search', { search: `%${search}%` });
    }
    if (is_active !== undefined) {
      qb.andWhere('brand.is_active = :is_active', { is_active });
    }

    qb.orderBy(`brand.${sort_by}`, sort_order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Brand | null> {
    return this.repo.findOne({ where: { id, deleted_at: null } });
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.repo.findOne({ where: { name, deleted_at: null } });
  }

  async create(entity: Partial<Brand>): Promise<Brand> {
    const brand = this.repo.create(entity);
    return this.repo.save(brand);
  }

  async update(id: string, entity: Partial<Brand>): Promise<Brand> {
    await this.repo.update({ id }, entity);
    return this.findOne(id) as Promise<Brand>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }
}
