import { IsEmail, IsString, Matches, IsNotEmpty, IsOptional } from 'class-validator';

export class SignupDto {

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/, {
        message: 'Password must be at least 8 characters long and contain at least one digit, one special character, one lowercase letter, and one Uppercase letter.'
    })
    password: string;
}