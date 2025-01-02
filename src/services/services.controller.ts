import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('file')
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body() createServiceDto: CreateServiceDto) {
    return await this.servicesService.create(file, createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File | null, 
    @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, file, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
