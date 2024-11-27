import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/, {
        message: 'Password must be at least 8 characters long and contain at least one digit, one special character, one lowercase letter, and one Uppercase letter.'
    })
    oldPassword: string;

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
