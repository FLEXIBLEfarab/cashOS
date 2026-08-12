import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { BrandRepository } from '../repositories/brand.repository';
import { UnitRepository } from '../repositories/unit.repository';
import { TaxRepository } from '../repositories/tax.repository';
import { BarcodeRepository } from '../repositories/barcode.repository';
import { PriceRepository } from '../repositories/price.repository';
import { StockInfoRepository } from '../repositories/stock-info.repository';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { ProductFilterDto } from '../dto/product/product-filter.dto';
import { ProductResponseDto } from '../dto/product/product-response.dto';
import { Product } from '../entities/product.entity';
import { Barcode } from '../entities/barcode.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Price } from '../entities/price.entity';
import { StockInfo } from '../entities/stock-info.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly brandRepo: BrandRepository,
    private readonly unitRepo: UnitRepository,
    private readonly taxRepo: TaxRepository,
    private readonly barcodeRepo: BarcodeRepository,
    private readonly priceRepo: PriceRepository,
    private readonly stockRepo: StockInfoRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    await this.validateReferences(dto);
    await this.validateSkuUnique(dto.sku);
    if (dto.barcodes?.length) {
      await this.validateBarcodeCodesUnique(dto.barcodes.map((b) => b.code));
    }

    const product = await this.dataSource.transaction(async (manager) => {
      const productEntity = manager.getRepository(Product).create({
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        category_id: dto.category_id,
        brand_id: dto.brand_id,
        unit_id: dto.unit_id,
        tax_id: dto.tax_id,
        purchase_price: dto.purchase_price,
        weight: dto.weight,
        weight_unit: dto.weight_unit,
        is_active: dto.is_active,
      });
      const saved = await manager.getRepository(Product).save(productEntity);

      const promises: Promise<unknown>[] = [];

      if (dto.barcodes?.length) {
        promises.push(
          manager.getRepository(Barcode).save(
            dto.barcodes.map((b) =>
              manager.getRepository(Barcode).create({ ...b, product_id: saved.id }),
            ),
          ),
        );
      }
      if (dto.images?.length) {
        promises.push(
          manager.getRepository(ProductImage).save(
            dto.images.map((i) =>
              manager.getRepository(ProductImage).create({ ...i, product_id: saved.id }),
            ),
          ),
        );
      }
      if (dto.prices?.length) {
        promises.push(
          manager.getRepository(Price).save(
            dto.prices.map((p) =>
              manager.getRepository(Price).create({
                ...p,
                product_id: saved.id,
                valid_from: p.valid_from ? new Date(p.valid_from) : null,
                valid_until: p.valid_until ? new Date(p.valid_until) : null,
              }),
            ),
          ),
        );
      }
      if (dto.stock_info?.length) {
        promises.push(
          manager.getRepository(StockInfo).save(
            dto.stock_info.map((s) =>
              manager.getRepository(StockInfo).create({ ...s, product_id: saved.id }),
            ),
          ),
        );
      }

      await Promise.all(promises);
      return saved;
    });

    const full = await this.productRepo.findOne(product.id);
    if (!full) {
      throw new InternalServerErrorException('Ошибка при создании товара');
    }
    return this.mapToResponse(full);
  }

  async findAll(filter: ProductFilterDto): Promise<{
    data: ProductResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    const { data, total } = await this.productRepo.findAll(filter);
    return {
      data: data.map((p) => this.mapToResponse(p)),
      meta: { total, page: filter.page, limit: filter.limit },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Товар с ID "${id}" не найден`);
    }
    return this.mapToResponse(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Товар с ID "${id}" не найден`);
    }

    await this.validateReferences(dto);
    if (dto.sku && dto.sku !== product.sku) {
      await this.validateSkuUnique(dto.sku);
    }
    if (dto.barcodes?.length) {
      const codes = dto.barcodes.map((b) => b.code);
      await this.validateBarcodeCodesUnique(codes, id);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Product).update(
        { id },
        {
          sku: dto.sku,
          name: dto.name,
          description: dto.description,
          category_id: dto.category_id,
          brand_id: dto.brand_id,
          unit_id: dto.unit_id,
          tax_id: dto.tax_id,
          purchase_price: dto.purchase_price,
          weight: dto.weight,
          weight_unit: dto.weight_unit,
          is_active: dto.is_active,
        },
      );

      if (dto.barcodes !== undefined) {
        await manager.getRepository(Barcode).softDelete({ product_id: id });
        if (dto.barcodes.length) {
          await manager.getRepository(Barcode).save(
            dto.barcodes.map((b) =>
              manager.getRepository(Barcode).create({ ...b, product_id: id }),
            ),
          );
        }
      }
      if (dto.images !== undefined) {
        await manager.getRepository(ProductImage).softDelete({ product_id: id });
        if (dto.images.length) {
          await manager.getRepository(ProductImage).save(
            dto.images.map((i) =>
              manager.getRepository(ProductImage).create({ ...i, product_id: id }),
            ),
          );
        }
      }
      if (dto.prices !== undefined) {
        await manager.getRepository(Price).softDelete({ product_id: id });
        if (dto.prices.length) {
          await manager.getRepository(Price).save(
            dto.prices.map((p) =>
              manager.getRepository(Price).create({
                ...p,
                product_id: id,
                valid_from: p.valid_from ? new Date(p.valid_from) : null,
                valid_until: p.valid_until ? new Date(p.valid_until) : null,
              }),
            ),
          );
        }
      }
      if (dto.stock_info !== undefined) {
        await manager.getRepository(StockInfo).softDelete({ product_id: id });
        if (dto.stock_info.length) {
          await manager.getRepository(StockInfo).save(
            dto.stock_info.map((s) =>
              manager.getRepository(StockInfo).create({ ...s, product_id: id }),
            ),
          );
        }
      }
    });

    const full = await this.productRepo.findOne(id);
    if (!full) {
      throw new InternalServerErrorException('Ошибка при обновлении товара');
    }
    return this.mapToResponse(full);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepo.findOne(id);
    if (!product) {
      throw new NotFoundException(`Товар с ID "${id}" не найден`);
    }
    await this.productRepo.softDelete(id);
  }

  private async validateReferences(dto: CreateProductDto | UpdateProductDto): Promise<void> {
    if (dto.category_id) {
      const category = await this.categoryRepo.findOne(dto.category_id);
      if (!category) {
        throw new NotFoundException(`Категория с ID "${dto.category_id}" не найдена`);
      }
    }
    if (dto.brand_id) {
      const brand = await this.brandRepo.findOne(dto.brand_id);
      if (!brand) {
        throw new NotFoundException(`Бренд с ID "${dto.brand_id}" не найден`);
      }
    }
    if (dto.unit_id) {
      const unit = await this.unitRepo.findOne(dto.unit_id);
      if (!unit) {
        throw new NotFoundException(`Единица измерения с ID "${dto.unit_id}" не найдена`);
      }
    }
    if (dto.tax_id) {
      const tax = await this.taxRepo.findOne(dto.tax_id);
      if (!tax) {
        throw new NotFoundException(`Налог с ID "${dto.tax_id}" не найден`);
      }
    }
  }

  private async validateSkuUnique(sku: string): Promise<void> {
    const existing = await this.productRepo.findBySku(sku);
    if (existing) {
      throw new ConflictException(`Товар с артикулом "${sku}" уже существует`);
    }
  }

  private async validateBarcodeCodesUnique(codes: string[], excludeProductId?: string): Promise<void> {
    for (const code of codes) {
      const existing = await this.barcodeRepo.findByCode(code);
      if (existing && existing.product_id !== excludeProductId) {
        throw new ConflictException(`Штрихкод "${code}" уже используется`);
      }
    }
  }

  private mapToResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category
        ? { id: product.category.id, name: product.category.name }
        : null,
      brand: product.brand
        ? { id: product.brand.id, name: product.brand.name }
        : null,
      unit: product.unit
        ? { id: product.unit.id, name: product.unit.name, code: product.unit.code }
        : null,
      tax: product.tax
        ? { id: product.tax.id, name: product.tax.name, rate: product.tax.rate }
        : null,
      purchase_price: product.purchase_price,
      weight: product.weight,
      weight_unit: product.weight_unit,
      is_active: product.is_active,
      barcodes: (product.barcodes || []).map((b) => ({
        id: b.id,
        code: b.code,
        type: b.type,
        is_primary: b.is_primary,
        created_at: b.created_at,
      })),
      images: (product.images || []).map((i) => ({
        id: i.id,
        url: i.url,
        alt_text: i.alt_text,
        sort_order: i.sort_order,
        is_main: i.is_main,
      })),
      prices: (product.prices || []).map((p) => ({
        id: p.id,
        value: p.value,
        branch_id: p.branch_id,
        valid_from: p.valid_from,
        valid_until: p.valid_until,
        is_active: p.is_active,
      })),
      stock_info: (product.stock_info || []).map((s) => ({
        id: s.id,
        branch_id: s.branch_id,
        warehouse_id: s.warehouse_id,
        quantity: s.quantity,
        reserved_quantity: s.reserved_quantity,
        min_quantity: s.min_quantity,
      })),
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }
}
