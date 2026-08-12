import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UnitRepository } from '../repositories/unit.repository';
import { CreateUnitDto } from '../dto/unit/create-unit.dto';
import { UpdateUnitDto } from '../dto/unit/update-unit.dto';
import { UnitFilterDto } from '../dto/unit/unit-filter.dto';
import { UnitResponseDto } from '../dto/unit/unit-response.dto';
import { Unit } from '../entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(private readonly unitRepo: UnitRepository) {}

  async create(dto: CreateUnitDto): Promise<UnitResponseDto> {
    const existing = await this.unitRepo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Единица измерения с кодом "${dto.code}" уже существует`);
    }
    const unit = await this.unitRepo.create(dto);
    return this.mapToResponse(unit);
  }

  async findAll(filter: UnitFilterDto): Promise<{ data: UnitResponseDto[]; meta: { total: number; page: number; limit: number } }> {
    const { data, total } = await this.unitRepo.findAll(filter);
    return {
      data: data.map((u) => this.mapToResponse(u)),
      meta: { total, page: filter.page, limit: filter.limit },
    };
  }

  async findOne(id: string): Promise<UnitResponseDto> {
    const unit = await this.unitRepo.findOne(id);
    if (!unit) {
      throw new NotFoundException(`Единица измерения с ID "${id}" не найдена`);
    }
    return this.mapToResponse(unit);
  }

  async update(id: string, dto: UpdateUnitDto): Promise<UnitResponseDto> {
    const unit = await this.unitRepo.findOne(id);
    if (!unit) {
      throw new NotFoundException(`Единица измерения с ID "${id}" не найдена`);
    }
    if (dto.code && dto.code !== unit.code) {
      const existing = await this.unitRepo.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Единица измерения с кодом "${dto.code}" уже существует`);
      }
    }
    const updated = await this.unitRepo.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const unit = await this.unitRepo.findOne(id);
    if (!unit) {
      throw new NotFoundException(`Единица измерения с ID "${id}" не найдена`);
    }
    await this.unitRepo.softDelete(id);
  }

  private mapToResponse(unit: Unit): UnitResponseDto {
    return {
      id: unit.id,
      name: unit.name,
      code: unit.code,
      abbreviation: unit.abbreviation,
      is_active: unit.is_active,
      created_at: unit.created_at,
      updated_at: unit.updated_at,
    };
  }
}
