import { Injectable, NotFoundException } from '@nestjs/common';
import { StockInfoRepository } from '../repositories/stock-info.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CreateStockInfoDto } from '../dto/stock-info/create-stock-info.dto';
import { UpdateStockInfoDto } from '../dto/stock-info/update-stock-info.dto';
import { StockInfoFilterDto } from '../dto/stock-info/stock-info-filter.dto';
import { StockInfoResponseDto } from '../dto/stock-info/stock-info-response.dto';
import { StockInfo } from '../entities/stock-info.entity';

@Injectable()
export class StockInfoService {
  constructor(
    private readonly stockRepo: StockInfoRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async create(dto: CreateStockInfoDto): Promise<StockInfoResponseDto> {
    const product = await this.productRepo.findOne(dto.product_id);
    if (!product) {
      throw new NotFoundException(`Товар с ID "${dto.product_id}" не найден`);
    }
    const stock = await this.stockRepo.create(dto);
    return this.mapToResponse(stock);
  }

  async findAll(filter: StockInfoFilterDto): Promise<{ data: StockInfoResponseDto[]; meta: { total: number; page: number; limit: number } }> {
    const { data, total } = await this.stockRepo.findAll(filter);
    return {
      data: data.map((s) => this.mapToResponse(s)),
      meta: { total, page: filter.page, limit: filter.limit },
    };
  }

  async findOne(id: string): Promise<StockInfoResponseDto> {
    const stock = await this.stockRepo.findOne(id);
    if (!stock) {
      throw new NotFoundException(`Остаток с ID "${id}" не найден`);
    }
    return this.mapToResponse(stock);
  }

  async update(id: string, dto: UpdateStockInfoDto): Promise<StockInfoResponseDto> {
    const stock = await this.stockRepo.findOne(id);
    if (!stock) {
      throw new NotFoundException(`Остаток с ID "${id}" не найден`);
    }
    if (dto.product_id) {
      const product = await this.productRepo.findOne(dto.product_id);
      if (!product) {
        throw new NotFoundException(`Товар с ID "${dto.product_id}" не найден`);
      }
    }
    const updated = await this.stockRepo.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const stock = await this.stockRepo.findOne(id);
    if (!stock) {
      throw new NotFoundException(`Остаток с ID "${id}" не найден`);
    }
    await this.stockRepo.softDelete(id);
  }

  private mapToResponse(stock: StockInfo): StockInfoResponseDto {
    return {
      id: stock.id,
      product_id: stock.product_id,
      branch_id: stock.branch_id,
      warehouse_id: stock.warehouse_id,
      quantity: stock.quantity,
      reserved_quantity: stock.reserved_quantity,
      min_quantity: stock.min_quantity,
      is_active: stock.is_active,
      created_at: stock.created_at,
      updated_at: stock.updated_at,
    };
  }
}
