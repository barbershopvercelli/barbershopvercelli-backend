import { IsEmail, IsNotEmpty, IsString, ValidateIf, IsPhoneNumber, Matches } from 'class-validator';

export class LoginDto {

    // If phone is not provided, validate email
    @ValidateIf(o => !o.phone)  // Apply email validation if phone is not provided
    @IsNotEmpty()
    @IsEmail()
    email?: string;  // Make email optional

    // If email is not provided, validate phone
    @ValidateIf(o => !o.email)  // Apply phone validation if email is not provided
    @IsNotEmpty()
    @IsPhoneNumber(null, { message: 'Invalid phone number format' }) // null means it supports any country code
    phone?: string;  // Make phone optional

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/, {
        message: 'Password must be at least 8 characters long and contain at least one digit, one special character, one lowercase letter, and one Uppercase letter.'
    })
    password: string;

    @IsNotEmpty()
    @IsString()
    deviceId: string;
}
