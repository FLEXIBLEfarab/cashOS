import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TaxRepository } from '../repositories/tax.repository';
import { CreateTaxDto } from '../dto/tax/create-tax.dto';
import { UpdateTaxDto } from '../dto/tax/update-tax.dto';
import { TaxFilterDto } from '../dto/tax/tax-filter.dto';
import { TaxResponseDto } from '../dto/tax/tax-response.dto';
import { Tax } from '../entities/tax.entity';

@Injectable()
export class TaxesService {
  constructor(private readonly taxRepo: TaxRepository) {}

  async create(dto: CreateTaxDto): Promise<TaxResponseDto> {
    const existing = await this.taxRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Налог с названием "${dto.name}" уже существует`);
    }
    const tax = await this.taxRepo.create(dto);
    return this.mapToResponse(tax);
  }

  async findAll(filter: TaxFilterDto): Promise<{ data: TaxResponseDto[]; meta: { total: number; page: number; limit: number } }> {
    const { data, total } = await this.taxRepo.findAll(filter);
    return {
      data: data.map((t) => this.mapToResponse(t)),
      meta: { total, page: filter.page, limit: filter.limit },
    };
  }

  async findOne(id: string): Promise<TaxResponseDto> {
    const tax = await this.taxRepo.findOne(id);
    if (!tax) {
      throw new NotFoundException(`Налог с ID "${id}" не найден`);
    }
    return this.mapToResponse(tax);
  }

  async update(id: string, dto: UpdateTaxDto): Promise<TaxResponseDto> {
    const tax = await this.taxRepo.findOne(id);
    if (!tax) {
      throw new NotFoundException(`Налог с ID "${id}" не найден`);
    }
    if (dto.name && dto.name !== tax.name) {
      const existing = await this.taxRepo.findByName(dto.name);
      if (existing) {
        throw new ConflictException(`Налог с названием "${dto.name}" уже существует`);
      }
    }
    const updated = await this.taxRepo.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const tax = await this.taxRepo.findOne(id);
    if (!tax) {
      throw new NotFoundException(`Налог с ID "${id}" не найден`);
    }
    await this.taxRepo.softDelete(id);
  }

  private mapToResponse(tax: Tax): TaxResponseDto {
    return {
      id: tax.id,
      name: tax.name,
      rate: tax.rate,
      is_included: tax.is_included,
      is_active: tax.is_active,
      created_at: tax.created_at,
      updated_at: tax.updated_at,
    };
  }
}
