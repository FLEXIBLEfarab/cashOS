import { PartialType } from '@nestjs/swagger';
import { CreateStockInfoDto } from './create-stock-info.dto';

export class UpdateStockInfoDto extends PartialType(CreateStockInfoDto) {}
