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
import { StockInfoService } from '../services/stock-info.service';
import { CreateStockInfoDto } from '../dto/stock-info/create-stock-info.dto';
import { UpdateStockInfoDto } from '../dto/stock-info/update-stock-info.dto';
import { StockInfoFilterDto } from '../dto/stock-info/stock-info-filter.dto';
import { StockInfoResponseDto } from '../dto/stock-info/stock-info-response.dto';

@ApiTags('Stock Info')
@Controller('stock-info')
export class StockInfoController {
  constructor(private readonly stockInfoService: StockInfoService) {}

  @Get()
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ ÑÐ¿Ð¸ÑÐ¾Ðº ÑÐºÐ»Ð°Ð´ÑÐºÐ¸Ñ… Ð¾ÑÑ‚Ð°Ñ‚ÐºÐ¾Ð²' })
  @ApiQuery({ name: 'product_id', required: false })
  @ApiQuery({ name: 'branch_id', required: false })
  @ApiQuery({ name: 'warehouse_id', required: false })
  @ApiQuery({ name: 'is_active', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: StockInfoResponseDto, isArray: true })
  async findAll(@Query() filter: StockInfoFilterDto): Promise<{
    data: StockInfoResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.stockInfoService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ðº Ð¿Ð¾ ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: StockInfoResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<StockInfoResponseDto> {
    return this.stockInfoService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ ÑÐºÐ»Ð°Ð´ÑÐºÐ¾Ð¹ Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ðº' })
  @ApiBody({ type: CreateStockInfoDto })
  @ApiResponse({ status: 201, type: StockInfoResponseDto })
  @ApiResponse({ status: 404 })
  async create(@Body() dto: CreateStockInfoDto): Promise<StockInfoResponseDto> {
    return this.stockInfoService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ÐžÐ±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ ÑÐºÐ»Ð°Ð´ÑÐºÐ¾Ð¹ Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ðº' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateStockInfoDto })
  @ApiResponse({ status: 200, type: StockInfoResponseDto })
  @ApiResponse({ status: 404 })
  async update(@Param('id') id: string, @Body() dto: UpdateStockInfoDto): Promise<StockInfoResponseDto> {
    return this.stockInfoService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ð£Ð´Ð°Ð»Ð¸Ñ‚ÑŒ ÑÐºÐ»Ð°Ð´ÑÐºÐ¾Ð¹ Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ðº' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.stockInfoService.remove(id);
  }
}

