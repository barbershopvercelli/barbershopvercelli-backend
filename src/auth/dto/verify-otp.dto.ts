import { IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';

export class VerifyOtpDto {

    @IsNotEmpty()
    @IsNumber()
    userId?: number;

    @IsNotEmpty()
    @IsNumber()
    otp?: number;

    @IsNotEmpty()
    @IsString()
    @IsIn(['emailVerification', 'resetPassword'], {
        message: 'Reason must be either "emailVerification" or "resetPassword"',
    })
    reason: string;

    @IsNotEmpty()
    @IsString()
    deviceId: string;
}
