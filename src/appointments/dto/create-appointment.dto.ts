import { IsNotEmpty, IsArray, IsEnum, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
    @IsNotEmpty()
    @IsNumber()
    branchId: number;

    @IsNotEmpty()
    @IsArray()
    services: number[]; // Array of service IDs

    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsEnum(['STRIPE', 'POS'])
    paymentMethod: 'STRIPE' | 'POS';

    @IsNotEmpty()
    @IsNumber()
    totalCost: number;
}
