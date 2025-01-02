// CreateBranchDTO
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateBranchDto {
    @IsNotEmpty()
    @IsString()
    @Length(1, 255)
    name: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    @Length(1, 20)
    contact: string;
}