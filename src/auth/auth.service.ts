import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma.service';
import {
  // sendSMSOtp,
  generateOtp,
  hashPassword,
  sendEmailOtp,
  comparePassword
} from '../services/utils';
import { JwtService } from '@nestjs/jwt'
import { Prisma } from '@prisma/client';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseDto } from './dto/response.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ConfigService } from '@nestjs/config';
import { SocialLoginDto } from './dto/social-login.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService
  ) { }

  // Helper to generate SIGNED JWT token
  async SignToken(userId: number): Promise<string> {
    const payload = {
      sub: userId,
    }
    try {
      const token = await this.jwt.signAsync(
        payload,
        {
          expiresIn: '365d',
          secret: this.configService.get<string>('JWT_SECRET')
        }
      )
      return token
    } catch (err) {
      console.log(err)
    }

  }

  // Helper to send OTP
  private async sendOtp(userId: number, email?: string, phone?: string): Promise<void> {
    const otp = generateOtp();
    await this.prisma.otp.upsert({
      where: { userId },
      create: { userId, otp },
      update: { otp },
    });

    if (email) {
      await sendEmailOtp(email, otp);
    } else if (phone) {
      // await sendSMSOtp(phone, otp);
    }
  }

  // Standard response structure for success
  private createResponse(message: string, data: any = null): ResponseDto {
    return { message, data };
  }

  // Signup Logic
  async signup(signupData: SignupDto): Promise<ResponseDto> {
    signupData.password = await hashPassword(signupData.password);

    let user;
    try {
      user = await this.prisma.user.create({ data: signupData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new UnauthorizedException('User already exists');
      }
      throw new Error('Unexpected error occurred');
    }

    await this.sendOtp(user.id, signupData.email, signupData.phone);

    return this.createResponse('OTP sent successfully', { userId: user.id });
  }

  // OTP verification logic
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<ResponseDto> {
    const otpRecord = await this.prisma.otp.findUnique({ where: { userId: verifyOtpDto.userId } });

    if (!otpRecord) {
      throw new UnauthorizedException('OTP record not found');
    }

    if (otpRecord.otp !== verifyOtpDto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (verifyOtpDto.reason === 'emailVerification') {
      const updatedUser = await this.prisma.user.update({
        where: { id: verifyOtpDto.userId },
        data: { isVerified: true },
      });

      delete updatedUser.password
      // const token = this.generateToken(verifyOtpDto.userId);
      const token = await this.SignToken(verifyOtpDto.userId)
      return this.createResponse('Email verified successfully', { token, user: updatedUser });
    } else if (verifyOtpDto.reason === 'resetPassword') {
      return this.createResponse('OTP verified');
    }

    throw new BadRequestException('Invalid reason provided');
  }

  // Resend OTP
  async resendOtp(userId: number): Promise<ResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.sendOtp(userId, user.email, user.phone);

    return this.createResponse('OTP resent successfully', { userId });
  }

  // Login Logic
  async login(credentials: LoginDto): Promise<ResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: credentials?.email, phone: credentials?.phone },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException('This email is authenticated through a third-party service');
    }

    const isPasswordValid = await comparePassword(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (!user.isVerified) {
      await this.sendOtp(user.id, credentials.email, credentials.phone);
      return this.createResponse('OTP sent successfully', { userId: user.id });
    }

    // const token = this.generateToken(user.id);
    const token = await this.SignToken(user.id)

    delete user.password;
    return this.createResponse('Login successful', { token, user });
  }

  // Forgot Password Logic
  async forgetPassword(forgetPasswordDto: ForgetPasswordDto): Promise<ResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgetPasswordDto?.email, phone: forgetPasswordDto?.phone },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException('This email is authenticated through a third-party service');
    }

    await this.sendOtp(user.id, forgetPasswordDto?.email, forgetPasswordDto?.phone);
    return this.createResponse('OTP sent successfully', { userId: user.id });
  }

  // Reset Password Logic
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResponseDto> {
    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await hashPassword(resetPasswordDto.password);
    await this.prisma.user.update({
      where: { id: resetPasswordDto.userId },
      data: { password: hashedPassword },
    });

    return this.createResponse('Password reset successfully');
  }

  // Social Login Logic
  async socialLogin(socialLoginDto: SocialLoginDto): Promise<ResponseDto> {
    if (socialLoginDto.platform === 'Google') {
      const decoded = jwt.decode(socialLoginDto.token, { complete: true }) as { [key: string]: any };

      if (!decoded || !decoded.payload) {
        throw new Error('Invalid token');
      }

      // Extract required fields
      const { email, name, picture } = decoded.payload;
      // Split name into firstName and lastName
      const [firstName, ...lastNameParts] = name?.split(' ');
      const lastName = lastNameParts?.join(' ');

      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            avatarUrl: picture,
            isVerified: true
          }
        });
      }

      // const token = this.generateToken(user.id);
      const token = await this.SignToken(user.id)

      delete user.password;
      return this.createResponse('Login successful', { token, user });
    } else if (socialLoginDto.platform === 'Facebook') {
      // Verify token using the debug endpoint
      const appToken = `${this.configService.get<string>('FACEBOOK_APP_ID')}|${this.configService.get<string>('FACEBOOK_APP_SECRET')}`
      const debugUrl = `https://graph.facebook.com/debug_token?input_token=${socialLoginDto.token}&access_token=${appToken}`;

      const debugResponse = await axios.get(debugUrl);
      const data = debugResponse.data.data;

      if (!data.is_valid) {
        throw new Error('Invalid Facebook token');
      }

      // Fetch user info
      const userInfoUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${socialLoginDto.token}`;
      const userInfoResponse = await axios.get(userInfoUrl);
      const userInfo = userInfoResponse.data;

      // Split name into firstName and lastName
      const [firstName, ...lastNameParts] = userInfo?.name?.split(' ');
      const lastName = lastNameParts?.join(' ');

      let user = await this.prisma.user.findUnique({
        where: { email: userInfo.email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            firstName,
            lastName,
            email: userInfo.email,
            avatarUrl: userInfo?.picture?.data?.url,
            isVerified: true
          }
        });
      }

      // const token = this.generateToken(user.id);
      const token = await this.SignToken(user.id)
      delete user.password;
      return this.createResponse('Login successful', { token, user });
    } else if (socialLoginDto.platform === 'Apple') {
      const decoded = jwt.decode(socialLoginDto.token, { complete: true }) as { [key: string]: any };

      if (!decoded || !decoded.payload) {
        throw new Error('Invalid token');
      }

      const { email } = decoded.payload;

      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const firstName = socialLoginDto.firstName;
        const lastName = socialLoginDto.lastName;
        user = await this.prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            isVerified: true
          }
        });
      }

      // const token = this.generateToken(user.id);
      const token = await this.SignToken(user.id)

      delete user.password;
      return this.createResponse('Login successful', { token, user });
    }
  }
}
