import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barcode } from '../entities/barcode.entity';
import { BarcodeFilterDto } from '../dto/barcode/barcode-filter.dto';

@Injectable()
export class BarcodeRepository {
  constructor(
    @InjectRepository(Barcode)
    private readonly repo: Repository<Barcode>,
  ) {}

  async findAll(filter: BarcodeFilterDto): Promise<{ data: Barcode[]; total: number }> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc', search, product_id, is_primary } = filter;

    const qb = this.repo.createQueryBuilder('barcode')
      .where('barcode.deleted_at IS NULL');

    if (search) {
      qb.andWhere('barcode.code ILIKE :search', { search: `%${search}%` });
    }
    if (product_id) {
      qb.andWhere('barcode.product_id = :product_id', { product_id });
    }
    if (is_primary !== undefined) {
      qb.andWhere('barcode.is_primary = :is_primary', { is_primary });
    }

    qb.orderBy(`barcode.${sort_by}`, sort_order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Barcode | null> {
    return this.repo.findOne({ where: { id, deleted_at: null } });
  }

  async findByCode(code: string): Promise<Barcode | null> {
    return this.repo.findOne({ where: { code, deleted_at: null } });
  }

  async findByProductId(product_id: string): Promise<Barcode[]> {
    return this.repo.find({ where: { product_id, deleted_at: null } });
  }

  async create(entity: Partial<Barcode>): Promise<Barcode> {
    const barcode = this.repo.create(entity);
    return this.repo.save(barcode);
  }

  async createMany(entities: Partial<Barcode>[]): Promise<Barcode[]> {
    const barcodes = this.repo.create(entities);
    return this.repo.save(barcodes);
  }

  async update(id: string, entity: Partial<Barcode>): Promise<Barcode> {
    await this.repo.update({ id }, entity);
    return this.findOne(id) as Promise<Barcode>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }

  async softDeleteByProductId(product_id: string): Promise<void> {
    await this.repo.softDelete({ product_id });
  }
}
