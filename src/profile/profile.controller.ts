import { Controller, Post, Body, Patch, Param, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { ChangePasswordDto } from './dto/change-paswword.dto';

@UseGuards(JwtGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadsDir = path.join(__dirname, '../../uploads');
          cb(null, uploadsDir); // You can customize the upload folder
        },
        filename: (req, file, cb) => {
          const extname = path.extname(file.originalname);
          const filename = `${Date.now()}${extname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadImage(@GetUser('id') userId: string, @UploadedFile() file: Express.Multer.File) {
    return await this.profileService.uploadImage(file, +userId);
  }

  @Patch('update')
  update(@GetUser('id') userId: number, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(userId, updateProfileDto);
  }

  @Patch('password')
  changePassword(@GetUser('id') userId: number, @Body() changePasswordDto: ChangePasswordDto) {
    return this.profileService.changePassword(userId, changePasswordDto);
  }
}
