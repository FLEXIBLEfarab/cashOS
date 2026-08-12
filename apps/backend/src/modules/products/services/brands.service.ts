import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BrandRepository } from '../repositories/brand.repository';
import { CreateBrandDto } from '../dto/brand/create-brand.dto';
import { UpdateBrandDto } from '../dto/brand/update-brand.dto';
import { BrandFilterDto } from '../dto/brand/brand-filter.dto';
import { BrandResponseDto } from '../dto/brand/brand-response.dto';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(private readonly brandRepo: BrandRepository) {}

  async create(dto: CreateBrandDto): Promise<BrandResponseDto> {
    const existing = await this.brandRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Бренд с названием "${dto.name}" уже существует`);
    }
    const brand = await this.brandRepo.create(dto);
    return this.mapToResponse(brand);
  }

  async findAll(filter: BrandFilterDto): Promise<{ data: BrandResponseDto[]; meta: { total: number; page: number; limit: number } }> {
    const { data, total } = await this.brandRepo.findAll(filter);
    return {
      data: data.map((b) => this.mapToResponse(b)),
      meta: { total, page: filter.page, limit: filter.limit },
    };
  }

  async findOne(id: string): Promise<BrandResponseDto> {
    const brand = await this.brandRepo.findOne(id);
    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }
    return this.mapToResponse(brand);
  }

  async update(id: string, dto: UpdateBrandDto): Promise<BrandResponseDto> {
    const brand = await this.brandRepo.findOne(id);
    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }
    if (dto.name && dto.name !== brand.name) {
      const existing = await this.brandRepo.findByName(dto.name);
      if (existing) {
        throw new ConflictException(`Бренд с названием "${dto.name}" уже существует`);
      }
    }
    const updated = await this.brandRepo.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.brandRepo.findOne(id);
    if (!brand) {
      throw new NotFoundException(`Бренд с ID "${id}" не найден`);
    }
    await this.brandRepo.softDelete(id);
  }

  private mapToResponse(brand: Brand): BrandResponseDto {
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description,
      logo_url: brand.logo_url,
      is_active: brand.is_active,
      created_at: brand.created_at,
      updated_at: brand.updated_at,
    };
  }
}
