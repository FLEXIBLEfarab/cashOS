import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Unit } from './entities/unit.entity';
import { Tax } from './entities/tax.entity';
import { Barcode } from './entities/barcode.entity';
import { ProductImage } from './entities/product-image.entity';
import { Price } from './entities/price.entity';
import { StockInfo } from './entities/stock-info.entity';

import { ProductRepository } from './repositories/product.repository';
import { CategoryRepository } from './repositories/category.repository';
import { BrandRepository } from './repositories/brand.repository';
import { UnitRepository } from './repositories/unit.repository';
import { TaxRepository } from './repositories/tax.repository';
import { BarcodeRepository } from './repositories/barcode.repository';
import { PriceRepository } from './repositories/price.repository';
import { StockInfoRepository } from './repositories/stock-info.repository';

import { ProductsService } from './services/products.service';
import { CategoriesService } from './services/categories.service';
import { BrandsService } from './services/brands.service';
import { UnitsService } from './services/units.service';
import { TaxesService } from './services/taxes.service';
import { BarcodesService } from './services/barcodes.service';
import { PricesService } from './services/prices.service';
import { StockInfoService } from './services/stock-info.service';

import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { BrandsController } from './controllers/brands.controller';
import { UnitsController } from './controllers/units.controller';
import { TaxesController } from './controllers/taxes.controller';
import { BarcodesController } from './controllers/barcodes.controller';
import { PricesController } from './controllers/prices.controller';
import { StockInfoController } from './controllers/stock-info.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      Unit,
      Tax,
      Barcode,
      ProductImage,
      Price,
      StockInfo,
    ]),
  ],
  controllers: [
    ProductsController,
    CategoriesController,
    BrandsController,
    UnitsController,
    TaxesController,
    BarcodesController,
    PricesController,
    StockInfoController,
  ],
  providers: [
    ProductRepository,
    CategoryRepository,
    BrandRepository,
    UnitRepository,
    TaxRepository,
    BarcodeRepository,
    PriceRepository,
    StockInfoRepository,
    ProductsService,
    CategoriesService,
    BrandsService,
    UnitsService,
    TaxesService,
    BarcodesService,
    PricesService,
    StockInfoService,
  ],
  exports: [
    ProductsService,
    CategoriesService,
    BrandsService,
    UnitsService,
    TaxesService,
    BarcodesService,
    PricesService,
    StockInfoService,
    ProductRepository,
    CategoryRepository,
    BrandRepository,
    UnitRepository,
    TaxRepository,
    BarcodeRepository,
    PriceRepository,
    StockInfoRepository,
  ],
})
export class ProductsModule {}
