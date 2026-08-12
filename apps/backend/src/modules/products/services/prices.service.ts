import { Injectable, NotFoundException } from '@nestjs/common';
import { PriceRepository } from '../repositories/price.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CreatePriceDto } from '../dto/price/create-price.dto';
import { UpdatePriceDto } from '../dto/price/update-price.dto';
import { PriceFilterDto } from '../dto/price/price-filter.dto';
import { PriceResponseDto } from '../dto/price/price-response.dto';
import { Price } from '../entities/price.entity';

@Injectable()
export class PricesService {
  constructor(
    private readonly priceRepo: PriceRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async create(dto: CreatePriceDto): Promise<PriceResponseDto> {
    const product = await this.productRepo.findOne(dto.product_id);
    if (!product) {
      throw new NotFoundException(`Товар с ID "${dto.product_id}" не найден`);
    }
    const price = await this.priceRepo.create(dto);
    return this.mapToResponse(price);
  }

  async findAll(filter: PriceFilterDto): Promise<{ data: PriceResponseDto[]; meta: { total: number; page: number; limit: number } }> {
    const { data, total } = await this.priceRepo.findAll(filter);
    return {
      data: data.map((p) => this.mapToResponse(p)),
      meta: { total, page: filter.page, limit: filter.limit },
    };
  }

  async findOne(id: string): Promise<PriceResponseDto> {
    const price = await this.priceRepo.findOne(id);
    if (!price) {
      throw new NotFoundException(`Цена с ID "${id}" не найдена`);
    }
    return this.mapToResponse(price);
  }

  async update(id: string, dto: UpdatePriceDto): Promise<PriceResponseDto> {
    const price = await this.priceRepo.findOne(id);
    if (!price) {
      throw new NotFoundException(`Цена с ID "${id}" не найдена`);
    }
    if (dto.product_id) {
      const product = await this.productRepo.findOne(dto.product_id);
      if (!product) {
        throw new NotFoundException(`Товар с ID "${dto.product_id}" не найден`);
      }
    }
    const updated = await this.priceRepo.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const price = await this.priceRepo.findOne(id);
    if (!price) {
      throw new NotFoundException(`Цена с ID "${id}" не найдена`);
    }
    await this.priceRepo.softDelete(id);
  }

  private mapToResponse(price: Price): PriceResponseDto {
    return {
      id: price.id,
      product_id: price.product_id,
      branch_id: price.branch_id,
      value: price.value,
      valid_from: price.valid_from,
      valid_until: price.valid_until,
      is_active: price.is_active,
      created_at: price.created_at,
      updated_at: price.updated_at,
    };
  }
}
