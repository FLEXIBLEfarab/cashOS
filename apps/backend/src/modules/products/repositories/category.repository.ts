import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CategoryFilterDto } from '../dto/category/category-filter.dto';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filter: CategoryFilterDto): Promise<{ data: Category[]; total: number }> {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'desc', search, parent_id, is_active } = filter;

    const qb = this.repo.createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .where('category.deleted_at IS NULL');

    if (search) {
      qb.andWhere('category.name ILIKE :search', { search: `%${search}%` });
    }
    if (parent_id) {
      qb.andWhere('category.parent_id = :parent_id', { parent_id });
    }
    if (is_active !== undefined) {
      qb.andWhere('category.is_active = :is_active', { is_active });
    }

    qb.orderBy(`category.${sort_by}`, sort_order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findTrees(): Promise<Category[]> {
    const treeRepo = this.dataSource.getTreeRepository(Category);
    return treeRepo.findTrees();
  }

  async findOne(id: string): Promise<Category | null> {
    return this.repo.findOne({
      where: { id, deleted_at: null },
      relations: ['parent', 'children'],
    });
  }

  async create(entity: Partial<Category>): Promise<Category> {
    const category = this.repo.create(entity);
    return this.repo.save(category);
  }

  async update(id: string, entity: Partial<Category>): Promise<Category> {
    await this.repo.update({ id }, entity);
    return this.findOne(id) as Promise<Category>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }
}
