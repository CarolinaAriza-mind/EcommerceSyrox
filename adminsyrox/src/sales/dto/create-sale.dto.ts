import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsPositive,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class SaleItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateSaleDto {
  @IsUUID()
  customerId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsEnum(SaleStatus)
  status: SaleStatus;
}
