import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { ProductFilterDto } from '../dto/product/product-filter.dto';
import { ProductResponseDto } from '../dto/product/product-response.dto';

@ApiTags('Products')
@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список товаров' })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию или SKU' })
  @ApiQuery({ name: 'category_id', required: false, description: 'Фильтр по категории' })
  @ApiQuery({ name: 'brand_id', required: false, description: 'Фильтр по бренду' })
  @ApiQuery({ name: 'is_active', required: false, description: 'Фильтр по активности' })
  @ApiQuery({ name: 'page', required: false, description: 'Номер страницы', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество на странице', example: 20 })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Поле сортировки', example: 'created_at' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Направление', example: 'desc' })
  @ApiResponse({ status: 200, description: 'Список товаров', type: ProductResponseDto, isArray: true })
  async findAll(@Query() filter: ProductFilterDto): Promise<{
    data: ProductResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.productsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiParam({ name: 'id', description: 'UUID товара' })
  @ApiResponse({ status: 200, description: 'Товар найден', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать товар' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Товар создан', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 409, description: 'SKU или штрихкод уже существует' })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить товар' })
  @ApiParam({ name: 'id', description: 'UUID товара' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Товар обновлён', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  @ApiResponse({ status: 409, description: 'SKU или штрихкод уже существует' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить товар (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID товара' })
  @ApiResponse({ status: 204, description: 'Товар удалён' })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
