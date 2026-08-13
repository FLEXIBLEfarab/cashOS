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
import { UnitsService } from '../services/units.service';
import { CreateUnitDto } from '../dto/unit/create-unit.dto';
import { UpdateUnitDto } from '../dto/unit/update-unit.dto';
import { UnitFilterDto } from '../dto/unit/unit-filter.dto';
import { UnitResponseDto } from '../dto/unit/unit-response.dto';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ ÑÐ¿Ð¸ÑÐ¾Ðº ÐµÐ´Ð¸Ð½Ð¸Ñ† Ð¸Ð·Ð¼ÐµÑ€ÐµÐ½Ð¸Ñ' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'is_active', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: UnitResponseDto, isArray: true })
  async findAll(@Query() filter: UnitFilterDto): Promise<{
    data: UnitResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    return this.unitsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ ÐµÐ´Ð¸Ð½Ð¸Ñ†Ñƒ Ð¸Ð·Ð¼ÐµÑ€ÐµÐ½Ð¸Ñ Ð¿Ð¾ ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: UnitResponseDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<UnitResponseDto> {
    return this.unitsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ ÐµÐ´Ð¸Ð½Ð¸Ñ†Ñƒ Ð¸Ð·Ð¼ÐµÑ€ÐµÐ½Ð¸Ñ' })
  @ApiBody({ type: CreateUnitDto })
  @ApiResponse({ status: 201, type: UnitResponseDto })
  @ApiResponse({ status: 409 })
  async create(@Body() dto: CreateUnitDto): Promise<UnitResponseDto> {
    return this.unitsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'ÐžÐ±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ ÐµÐ´Ð¸Ð½Ð¸Ñ†Ñƒ Ð¸Ð·Ð¼ÐµÑ€ÐµÐ½Ð¸Ñ' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUnitDto })
  @ApiResponse({ status: 200, type: UnitResponseDto })
  @ApiResponse({ status: 404 })
  @ApiResponse({ status: 409 })
  async update(@Param('id') id: string, @Body() dto: UpdateUnitDto): Promise<UnitResponseDto> {
    return this.unitsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ð£Ð´Ð°Ð»Ð¸Ñ‚ÑŒ ÐµÐ´Ð¸Ð½Ð¸Ñ†Ñƒ Ð¸Ð·Ð¼ÐµÑ€ÐµÐ½Ð¸Ñ' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.unitsService.remove(id);
  }
}

