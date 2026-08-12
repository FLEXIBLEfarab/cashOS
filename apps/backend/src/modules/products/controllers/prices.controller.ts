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
import { PricesService } from '../services/prices.service';
import { CreatePriceDto } from '../dto/price/create-price.dto';
import { UpdatePriceDto } from '../dto/price/update-price.dto';
import { PriceFilterDto } from '../dto/price/price-filter.dto';
import { PriceResponseDto } from '../dto/price/price-response.dto';

@ApiTags('Prices')
@Controller('v1/prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список цен' })
  @ApiQuery({ name: 'product_id', required: false })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'is_active', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PriceResponseDto, isArray: true })
  async findAll(@Query() filter: PriceFilterDto): Promise<{
    data: PriceResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.pricesService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить цену по ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: PriceResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<PriceResponseDto> {
    return this.pricesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать цену' })
  @ApiBody({ type: CreatePriceDto })
  @ApiResponse({ status: 201, type: PriceResponseDto })
  @ApiResponse({ status: 404 })
  async create(@Body() dto: CreatePriceDto): Promise<PriceResponseDto> {
    return this.pricesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить цену' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdatePriceDto })
  @ApiResponse({ status: 200, type: PriceResponseDto })
  @ApiResponse({ status: 404 })
  async update(@Param('id') id: string, @Body() dto: UpdatePriceDto): Promise<PriceResponseDto> {
    return this.pricesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить цену' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.pricesService.remove(id);
  }
}
