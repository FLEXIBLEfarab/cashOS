import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductFilterDto } from '../dto/product/product-filter.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async findAll(filter: ProductFilterDto): Promise<{ data: Product[]; total: number }> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc', search, category_id, brand_id, is_active } = filter;

    const qb = this.repo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.unit', 'unit')
      .leftJoinAndSelect('product.tax', 'tax')
      .leftJoinAndSelect('product.barcodes', 'barcodes')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.prices', 'prices')
      .leftJoinAndSelect('product.stock_info', 'stock_info')
      .where('product.deleted_at IS NULL');

    if (search) {
      qb.andWhere('(product.name ILIKE :search OR product.sku ILIKE :search)', { search: `%${search}%` });
    }
    if (category_id) {
      qb.andWhere('product.category_id = :category_id', { category_id });
    }
    if (brand_id) {
      qb.andWhere('product.brand_id = :brand_id', { brand_id });
    }
    if (is_active !== undefined) {
      qb.andWhere('product.is_active = :is_active', { is_active });
    }

    qb.orderBy(`product.${sort_by}`, sort_order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Product | null> {
    return this.repo.findOne({
      where: { id, deleted_at: null },
      relations: ['category', 'brand', 'unit', 'tax', 'barcodes', 'images', 'prices', 'stock_info'],
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.repo.findOne({ where: { sku, deleted_at: null } });
  }

  async create(entity: Partial<Product>): Promise<Product> {
    const product = this.repo.create(entity);
    return this.repo.save(product);
  }

  async update(id: string, entity: Partial<Product>): Promise<Product> {
    await this.repo.update({ id }, entity);
    return this.findOne(id) as Promise<Product>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }
}
