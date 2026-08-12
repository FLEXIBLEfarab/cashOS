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
import { TaxesService } from '../services/taxes.service';
import { CreateTaxDto } from '../dto/tax/create-tax.dto';
import { UpdateTaxDto } from '../dto/tax/update-tax.dto';
import { TaxFilterDto } from '../dto/tax/tax-filter.dto';
import { TaxResponseDto } from '../dto/tax/tax-response.dto';

@ApiTags('Taxes')
@Controller('v1/taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список налогов' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'is_active', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: TaxResponseDto, isArray: true })
  async findAll(@Query() filter: TaxFilterDto): Promise<{
    data: TaxResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.taxesService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить налог по ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: TaxResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<TaxResponseDto> {
    return this.taxesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать налог' })
  @ApiBody({ type: CreateTaxDto })
  @ApiResponse({ status: 201, type: TaxResponseDto })
  @ApiResponse({ status: 409 })
  async create(@Body() dto: CreateTaxDto): Promise<TaxResponseDto> {
    return this.taxesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить налог' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateTaxDto })
  @ApiResponse({ status: 200, type: TaxResponseDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async update(@Param('id') id: string, @Body() dto: UpdateTaxDto): Promise<TaxResponseDto> {
    return this.taxesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить налог' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.taxesService.remove(id);
  }
}
