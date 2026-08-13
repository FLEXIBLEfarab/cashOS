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
@Controller('barcodes')
export class BarcodesController {
  constructor(private readonly barcodesService: BarcodesService) {}

  @Get()
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ ÑÐ¿Ð¸ÑÐ¾Ðº ÑˆÑ‚Ñ€Ð¸Ñ…ÐºÐ¾Ð´Ð¾Ð²' })
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
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ ÑˆÑ‚Ñ€Ð¸Ñ…ÐºÐ¾Ð´ Ð¿Ð¾ ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: BarcodeResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<BarcodeResponseDto> {
    return this.barcodesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ ÑˆÑ‚Ñ€Ð¸Ñ…ÐºÐ¾Ð´' })
  @ApiBody({ type: CreateBarcodeDto })
  @ApiResponse({ status: 201, type: BarcodeResponseDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async create(@Body() dto: CreateBarcodeDto): Promise<BarcodeResponseDto> {
    return this.barcodesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ÐžÐ±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ ÑˆÑ‚Ñ€Ð¸Ñ…ÐºÐ¾Ð´' })
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
  @ApiOperation({ summary: 'Ð£Ð´Ð°Ð»Ð¸Ñ‚ÑŒ ÑˆÑ‚Ñ€Ð¸Ñ…ÐºÐ¾Ð´' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.barcodesService.remove(id);
  }
}

