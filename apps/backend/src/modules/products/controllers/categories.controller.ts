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
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/category/create-category.dto';
import { UpdateCategoryDto } from '../dto/category/update-category.dto';
import { CategoryFilterDto } from '../dto/category/category-filter.dto';
import { CategoryResponseDto } from '../dto/category/category-response.dto';

@ApiTags('Categories')
@Controller('v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список категорий' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'parent_id', required: false })
  @ApiQuery({ name: 'is_active', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: CategoryResponseDto, isArray: true })
  async findAll(@Query() filter: CategoryFilterDto): Promise<{
    data: CategoryResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.categoriesService.findAll(filter);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Получить дерево категорий' })
  @ApiResponse({ status: 200, type: CategoryResponseDto, isArray: true })
  async findTrees(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findTrees();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  @ApiResponse({ status: 404 })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
