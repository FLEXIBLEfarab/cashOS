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
import { BrandsService } from '../services/brands.service';
import { CreateBrandDto } from '../dto/brand/create-brand.dto';
import { UpdateBrandDto } from '../dto/brand/update-brand.dto';
import { BrandFilterDto } from '../dto/brand/brand-filter.dto';
import { BrandResponseDto } from '../dto/brand/brand-response.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ ÑÐ¿Ð¸ÑÐ¾Ðº Ð±Ñ€ÐµÐ½Ð´Ð¾Ð²' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'is_active', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: BrandResponseDto, isArray: true })
  async findAll(@Query() filter: BrandFilterDto): Promise<{
    data: BrandResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.brandsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ð±Ñ€ÐµÐ½Ð´ Ð¿Ð¾ ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: BrandResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<BrandResponseDto> {
    return this.brandsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð±Ñ€ÐµÐ½Ð´' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({ status: 201, type: BrandResponseDto })
  @ApiResponse({ status: 409 })
  async create(@Body() dto: CreateBrandDto): Promise<BrandResponseDto> {
    return this.brandsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ÐžÐ±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ Ð±Ñ€ÐµÐ½Ð´' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({ status: 200, type: BrandResponseDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto): Promise<BrandResponseDto> {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ð£Ð´Ð°Ð»Ð¸Ñ‚ÑŒ Ð±Ñ€ÐµÐ½Ð´' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.brandsService.remove(id);
  }
}

