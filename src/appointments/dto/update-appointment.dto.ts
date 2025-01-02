import { IsOptional, IsArray, IsEnum, IsNumber, IsString, IsDateString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @IsArray()
  services?: number[]; // Array of service IDs

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['STRIPE', 'POS'])
  paymentMethod?: 'STRIPE' | 'POS';

  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @IsOptional()
  @IsEnum(['pending', 'cancelled', 'approved'])
  status?: 'pending' | 'cancelled' | 'approved';
}
