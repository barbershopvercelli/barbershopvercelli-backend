// src/payments/dto/create-checkout-session.dto.ts
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  quantity: number;
}

export class CreateCheckoutSessionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}
