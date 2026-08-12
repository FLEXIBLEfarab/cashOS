import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto/category/create-category.dto';
import { UpdateCategoryDto } from '../dto/category/update-category.dto';
import { CategoryFilterDto } from '../dto/category/category-filter.dto';
import { CategoryResponseDto } from '../dto/category/category-response.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    if (dto.parent_id) {
      const parent = await this.categoryRepo.findOne(dto.parent_id);
      if (!parent) {
        throw new NotFoundException(`Родительская категория с ID "${dto.parent_id}" не найдена`);
      }
    }
    const category = await this.categoryRepo.create(dto);
    return this.mapToResponse(category);
  }

  async findAll(filter: CategoryFilterDto): Promise<{ data: CategoryResponseDto[]; meta: { total: number; page: number; limit: number } }> {
    const { data, total } = await this.categoryRepo.findAll(filter);
    return {
      data: data.map((c) => this.mapToResponse(c)),
      meta: { total, page: filter.page, limit: filter.limit },
    };
  }

  async findTrees(): Promise<CategoryResponseDto[]> {
    const trees = await this.categoryRepo.findTrees();
    return trees.map((t) => this.mapToResponse(t));
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findOne(id);
    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }
    return this.mapToResponse(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findOne(id);
    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }
    if (dto.parent_id) {
      const parent = await this.categoryRepo.findOne(dto.parent_id);
      if (!parent) {
        throw new NotFoundException(`Родительская категория с ID "${dto.parent_id}" не найдена`);
      }
      if (dto.parent_id === id) {
        throw new NotFoundException('Категория не может быть родителем самой себя');
      }
    }
    const updated = await this.categoryRepo.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepo.findOne(id);
    if (!category) {
      throw new NotFoundException(`Категория с ID "${id}" не найдена`);
    }
    await this.categoryRepo.softDelete(id);
  }

  private mapToResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      image_url: category.image_url,
      is_active: category.is_active,
      parent: category.parent
        ? { id: category.parent.id, name: category.parent.name }
        : null,
      children: category.children
        ? category.children.map((c) => ({ id: c.id, name: c.name }))
        : [],
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }
}
