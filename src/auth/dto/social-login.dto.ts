import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SocialLoginDto {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsOptional()
    @IsString()
    platform: string;

}