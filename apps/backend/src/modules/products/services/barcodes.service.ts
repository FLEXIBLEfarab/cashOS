import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { BarcodeRepository } from '../repositories/barcode.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CreateBarcodeDto } from '../dto/barcode/create-barcode.dto';
import { UpdateBarcodeDto } from '../dto/barcode/update-barcode.dto';
import { BarcodeFilterDto } from '../dto/barcode/barcode-filter.dto';
import { BarcodeResponseDto } from '../dto/barcode/barcode-response.dto';
import { Barcode } from '../entities/barcode.entity';

@Injectable()
export class BarcodesService {
  constructor(
    private readonly barcodeRepo: BarcodeRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async create(dto: CreateBarcodeDto): Promise<BarcodeResponseDto> {
    const product = await this.productRepo.findOne(dto.product_id);
    if (!product) {
      throw new NotFoundException(`Товар с ID "${dto.product_id}" не найден`);
    }
    const existing = await this.barcodeRepo.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Штрихкод "${dto.code}" уже существует`);
    }
    const barcode = await this.barcodeRepo.create(dto);
    return this.mapToResponse(barcode);
  }

  async findAll(filter: BarcodeFilterDto): Promise<{ data: BarcodeResponseDto[]; meta: { total: number; page: number; limit: number } }> {
    const { data, total } = await this.barcodeRepo.findAll(filter);
    return {
      data: data.map((b) => this.mapToResponse(b)),
      meta: { total, page: filter.page, limit: filter.limit },
    };
  }

  async findOne(id: string): Promise<BarcodeResponseDto> {
    const barcode = await this.barcodeRepo.findOne(id);
    if (!barcode) {
      throw new NotFoundException(`Штрихкод с ID "${id}" не найден`);
    }
    return this.mapToResponse(barcode);
  }

  async update(id: string, dto: UpdateBarcodeDto): Promise<BarcodeResponseDto> {
    const barcode = await this.barcodeRepo.findOne(id);
    if (!barcode) {
      throw new NotFoundException(`Штрихкод с ID "${id}" не найден`);
    }
    if (dto.code && dto.code !== barcode.code) {
      const existing = await this.barcodeRepo.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Штрихкод "${dto.code}" уже существует`);
      }
    }
    if (dto.product_id) {
      const product = await this.productRepo.findOne(dto.product_id);
      if (!product) {
        throw new NotFoundException(`Товар с ID "${dto.product_id}" не найден`);
      }
    }
    const updated = await this.barcodeRepo.update(id, dto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const barcode = await this.barcodeRepo.findOne(id);
    if (!barcode) {
      throw new NotFoundException(`Штрихкод с ID "${id}" не найден`);
    }
    await this.barcodeRepo.softDelete(id);
  }

  private mapToResponse(barcode: Barcode): BarcodeResponseDto {
    return {
      id: barcode.id,
      code: barcode.code,
      product_id: barcode.product_id,
      type: barcode.type,
      is_primary: barcode.is_primary,
      created_at: barcode.created_at,
      updated_at: barcode.updated_at,
    };
  }
}
