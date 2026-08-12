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
import { BarcodesService } from '../services/barcodes.service';
import { CreateBarcodeDto } from '../dto/barcode/create-barcode.dto';
import { UpdateBarcodeDto } from '../dto/barcode/update-barcode.dto';
import { BarcodeFilterDto } from '../dto/barcode/barcode-filter.dto';
import { BarcodeResponseDto } from '../dto/barcode/barcode-response.dto';

@ApiTags('Barcodes')
@Controller('v1/barcodes')
export class BarcodesController {
  constructor(private readonly barcodesService: BarcodesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список штрихкодов' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'product_id', required: false })
  @ApiQuery({ name: 'is_primary', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: BarcodeResponseDto, isArray: true })
  async findAll(@Query() filter: BarcodeFilterDto): Promise<{
    data: BarcodeResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.barcodesService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить штрихкод по ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: BarcodeResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<BarcodeResponseDto> {
    return this.barcodesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать штрихкод' })
  @ApiBody({ type: CreateBarcodeDto })
  @ApiResponse({ status: 201, type: BarcodeResponseDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async create(@Body() dto: CreateBarcodeDto): Promise<BarcodeResponseDto> {
    return this.barcodesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить штрихкод' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateBarcodeDto })
  @ApiResponse({ status: 200, type: BarcodeResponseDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async update(@Param('id') id: string, @Body() dto: UpdateBarcodeDto): Promise<BarcodeResponseDto> {
    return this.barcodesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить штрихкод' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.barcodesService.remove(id);
  }
}
