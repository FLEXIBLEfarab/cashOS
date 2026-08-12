import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Unit } from '../entities/unit.entity';
import { UnitFilterDto } from '../dto/unit/unit-filter.dto';

@Injectable()
export class UnitRepository {
  constructor(
    @InjectRepository(Unit)
    private readonly repo: Repository<Unit>,
  ) {}

  async findAll(filter: UnitFilterDto): Promise<{ data: Unit[]; total: number }> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc', search, is_active } = filter;

    const qb = this.repo.createQueryBuilder('unit')
      .where('unit.deleted_at IS NULL');

    if (search) {
      qb.andWhere('(unit.name ILIKE :search OR unit.code ILIKE :search)', { search: `%${search}%` });
    }
    if (is_active !== undefined) {
      qb.andWhere('unit.is_active = :is_active', { is_active });
    }

    qb.orderBy(`unit.${sort_by}`, sort_order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Unit | null> {
    return this.repo.findOne({ where: { id, deleted_at: IsNull() } });
  }

  async findByCode(code: string): Promise<Unit | null> {
    return this.repo.findOne({ where: { code, deleted_at: IsNull() } });
  }

  async create(entity: Partial<Unit>): Promise<Unit> {
    const unit = this.repo.create(entity);
    return this.repo.save(unit);
  }

  async update(id: string, entity: Partial<Unit>): Promise<Unit> {
    await this.repo.update({ id }, entity);
    return this.findOne(id) as Promise<Unit>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }
}
