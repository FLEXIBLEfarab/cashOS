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
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ ÑÐ¿Ð¸ÑÐ¾Ðº Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²' })
  @ApiQuery({ name: 'search', required: false, description: 'ÐŸÐ¾Ð¸ÑÐº Ð¿Ð¾ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸ÑŽ Ð¸Ð»Ð¸ SKU' })
  @ApiQuery({ name: 'category_id', required: false, description: 'Ð¤Ð¸Ð»ÑŒÑ‚Ñ€ Ð¿Ð¾ ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸' })
  @ApiQuery({ name: 'brand_id', required: false, description: 'Ð¤Ð¸Ð»ÑŒÑ‚Ñ€ Ð¿Ð¾ Ð±Ñ€ÐµÐ½Ð´Ñƒ' })
  @ApiQuery({ name: 'is_active', required: false, description: 'Ð¤Ð¸Ð»ÑŒÑ‚Ñ€ Ð¿Ð¾ Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¾ÑÑ‚Ð¸' })
  @ApiQuery({ name: 'page', required: false, description: 'ÐÐ¾Ð¼ÐµÑ€ ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ñ‹', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'ÐšÐ¾Ð»Ð¸Ñ‡ÐµÑÑ‚Ð²Ð¾ Ð½Ð° ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ðµ', example: 20 })
  @ApiQuery({ name: 'sort_by', required: false, description: 'ÐŸÐ¾Ð»Ðµ ÑÐ¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²ÐºÐ¸', example: 'created_at' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'ÐÐ°Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ', example: 'desc' })
  @ApiResponse({ status: 200, description: 'Ð¡Ð¿Ð¸ÑÐ¾Ðº Ñ‚Ð¾Ð²Ð°Ñ€Ð¾Ð²', type: ProductResponseDto, isArray: true })
  async findAll(@Query() filter: ProductFilterDto): Promise<{
    data: ProductResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.productsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ñ‚Ð¾Ð²Ð°Ñ€ Ð¿Ð¾ ID' })
  @ApiParam({ name: 'id', description: 'UUID Ñ‚Ð¾Ð²Ð°Ñ€Ð°' })
  @ApiResponse({ status: 200, description: 'Ð¢Ð¾Ð²Ð°Ñ€ Ð½Ð°Ð¹Ð´ÐµÐ½', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Ð¢Ð¾Ð²Ð°Ñ€ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ñ‚Ð¾Ð²Ð°Ñ€' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Ð¢Ð¾Ð²Ð°Ñ€ ÑÐ¾Ð·Ð´Ð°Ð½', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'ÐÐµÐºÐ¾Ñ€Ñ€ÐµÐºÑ‚Ð½Ñ‹Ðµ Ð´Ð°Ð½Ð½Ñ‹Ðµ' })
  @ApiResponse({ status: 409, description: 'SKU Ð¸Ð»Ð¸ ÑˆÑ‚Ñ€Ð¸Ñ…ÐºÐ¾Ð´ ÑƒÐ¶Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚' })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ÐžÐ±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ Ñ‚Ð¾Ð²Ð°Ñ€' })
  @ApiParam({ name: 'id', description: 'UUID Ñ‚Ð¾Ð²Ð°Ñ€Ð°' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Ð¢Ð¾Ð²Ð°Ñ€ Ð¾Ð±Ð½Ð¾Ð²Ð»Ñ‘Ð½', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Ð¢Ð¾Ð²Ð°Ñ€ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½' })
  @ApiResponse({ status: 409, description: 'SKU Ð¸Ð»Ð¸ ÑˆÑ‚Ñ€Ð¸Ñ…ÐºÐ¾Ð´ ÑƒÐ¶Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ð£Ð´Ð°Ð»Ð¸Ñ‚ÑŒ Ñ‚Ð¾Ð²Ð°Ñ€ (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID Ñ‚Ð¾Ð²Ð°Ñ€Ð°' })
  @ApiResponse({ status: 204, description: 'Ð¢Ð¾Ð²Ð°Ñ€ ÑƒÐ´Ð°Ð»Ñ‘Ð½' })
  @ApiResponse({ status: 404, description: 'Ð¢Ð¾Ð²Ð°Ñ€ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}

