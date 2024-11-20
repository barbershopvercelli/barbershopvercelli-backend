import { IsEmail, IsNotEmpty, ValidateIf, IsPhoneNumber, IsString, Matches, IsNumber } from 'class-validator';

export class ResetPasswordDto {

    @IsNotEmpty()
    @IsNumber()
    userId?: number;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/, {
        message: 'Password must be at least 8 characters long and contain at least one digit, one special character, one lowercase letter, and one Uppercase letter.'
    })
    password: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/, {
        message: 'Password must be at least 8 characters long and contain at least one digit, one special character, one lowercase letter, and one Uppercase letter.'
    })
    confirmPassword: string;
}
