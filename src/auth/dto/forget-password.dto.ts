import { IsEmail, IsNotEmpty, ValidateIf, IsPhoneNumber } from 'class-validator';

export class ForgetPasswordDto {

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
}
