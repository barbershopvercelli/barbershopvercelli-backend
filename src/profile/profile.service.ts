import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as cloudinary from 'cloudinary';
import { ResponseDto } from '../auth/dto/response.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { ChangePasswordDto } from './dto/change-paswword.dto';
import { comparePassword, hashPassword } from '../services/utils';

interface CloudinaryUploadResult {
  secure_url: string;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    cloudinary.v2.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

  }

  // Standard response structure for success
  private createResponse(message: string, data: any = null): ResponseDto {
    return { message, data };
  }

  // Upload image to Cloudinary
  async uploadImage(file: Express.Multer.File, userId: number): Promise<any> {
    try {
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          {
            resource_type: 'auto', // Automatically detect the resource type (image, video, etc.)
            folder: `barbershop-vecelli/${userId}`, // Cloudinary folder for this upload
            public_id: userId.toString(), // Optional: Set custom public ID for the image
          },
          (error, result) => {
            if (error) {
              reject(error); // Reject the promise if there is an error
            } else {
              resolve(result); // Resolve with the upload result
            }
          }
        ).end(file.buffer); // End the stream and pass the file buffer
      });

      if (result) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { avatarUrl: result?.secure_url },
        });
        return this.createResponse('Image uploaded successfully', { url: result?.secure_url });
      } else
        return this.createResponse('Error uploading Image', { url: null });
    } catch (error) {
      throw new Error('Error uploading image to Cloudinary: ' + error.message);
    }
  }

  // // Get the image URL
  // getImageUrl(publicId: string): string {
  //   return cloudinary.v2.url(publicId, {
  //     width: 300, // Resize image (optional)
  //     height: 300,
  //     crop: 'fill',
  //   });
  // }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { firstName: updateProfileDto.firstName, lastName: updateProfileDto.lastName },
    });

    return this.createResponse('Profile updated successfully', { firstName: updatedUser.firstName, lastName: updatedUser.lastName });
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Step 2: Compare the old password with the stored hashed password
    const isPasswordValid = await comparePassword(changePasswordDto.oldPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    // Step 3: Hash the new password before updating it
    const hashedPassword = await hashPassword(changePasswordDto.password);

    // Step 4: Update the user's password in the database
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return this.createResponse('Password updated successfully', {});
  }
}
