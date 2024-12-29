import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
import { ResponseDto } from '../auth/dto/response.dto';

interface CloudinaryUploadResult {
  secure_url: string;
}

@Injectable()
export class ServicesService {
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

  async create(file: Express.Multer.File, createServiceDto: CreateServiceDto): Promise<any> {
    try {
      // Step 1: Create the service entry in the database
      const newService = await this.prisma.service.create({
        data: {
          ...createServiceDto,  // Use the fields from the DTO
        },
      });

      // Step 2: Use the service ID to create a unique folder in Cloudinary
      const folderPath = `barbershop-vecelli/services`;

      // Step 3: Upload the image to Cloudinary
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          {
            resource_type: 'auto', // Automatically detect the resource type (image, video, etc.)
            folder: folderPath, // Cloudinary folder for this upload
            public_id: newService.id.toString(), // Optional: Set custom public ID for the image
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

      // Step 4: Update the service with the image URL
      if (result) {
        const updatedService = await this.prisma.service.update({
          where: { id: newService.id },
          data: {
            image: result?.secure_url, // Store the secure URL from Cloudinary
          },
        });
        return this.createResponse('Service created successfully', { updatedService });
      } else {
        return this.createResponse('Error uploading image', { url: null });
      }
    } catch (error) {
      throw new Error('Error creating service: ' + error.message);
    }
  }

  async findAll() {
    try {
      const services = await this.prisma.service.findMany();
      return this.createResponse('Services found successfully', services);
    } catch (error) {
      throw new Error('Error fetching services: ' + error.message);
    }
  }

  async findOne(id: number) {
    try {
      const service = await this.prisma.service.findUnique({ where: { id } });
      if (!service) {
        return this.createResponse('Service not found');
      }
      return this.createResponse('Service found successfully', service);
    } catch (error) {
      throw new Error('Error fetching service: ' + error.message);
    }
  }

  async update(
    id: number,
    file: Express.Multer.File | null,
    updateServiceDto: UpdateServiceDto
  ): Promise<any> {
    try {
      // Step 1: Fetch the existing service to ensure it exists
      const existingService = await this.prisma.service.findUnique({ where: { id } });
      if (!existingService) {
        return this.createResponse('Service not found');
      }

      let updatedData = { ...updateServiceDto };

      var serviceImage = existingService.image

      // Step 2: Handle image update if a file is provided
      if (file) {
        // Step 3: Define the Cloudinary folder path
        const folderPath = `barbershop-vecelli/services`;

        // Step 4: Delete the existing image from Cloudinary if it exists
        if (existingService.image && existingService.image.startsWith('https://res.cloudinary.com')) {
          const publicId = `${folderPath}/${id}`;
          await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.destroy(
              publicId,
              { resource_type: 'image' },
              (error, result) => {
                if (error) {
                  console.error('Error deleting existing image from Cloudinary:', error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
          });
        }

        // Step 5: Upload the new image to Cloudinary
        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          cloudinary.v2.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: folderPath,
              public_id: id.toString(),
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(file.buffer);
        });

        // Step 6: Add the new image URL to the updated data
        if (result) {
          serviceImage = result?.secure_url
        } else {
          // return this.createResponse('Error uploading new image to Cloudinary');
          throw new Error('Error uploading new image to Cloudinary.');
        }
      }

      // Step 7: Update the service in the database
      const updatedService = await this.prisma.service.update({
        where: { id },
        data: {
          ...updatedData,
          image: serviceImage
        },
      });

      return this.createResponse('Service updated successfully', { updatedService });
    } catch (error) {
      throw new Error('Error updating service: ' + error.message);
    }
  }


  async remove(id: number) {
    try {
      // Step 1: Fetch the service record to get the image URL
      const service = await this.prisma.service.findUnique({ where: { id } });
      if (!service) {
        return this.createResponse('Service not found');
      }


      // Check if the avatar URL starts with the specific Cloudinary URL prefix
      const cloudinaryUrlPrefix = 'https://res.cloudinary.com/dpnjvmgjk/image/upload';
      if (service?.image && service?.image?.startsWith(cloudinaryUrlPrefix)) {
        // Step 2: Extract the public ID from the Cloudinary image URL
        const publicId = service.image?.split('/').pop()?.split('.')[0]; // Extract public ID
        if (publicId) {
          // Step 3: Delete the image from Cloudinary
          await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.destroy(
              `barbershop-vecelli/services/${publicId}`,
              (error, result) => {
                if (error) {
                  console.error('Error deleting image from Cloudinary:', error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
          });
        }
      }

      // Step 4: Delete the service from the database
      const deletedService = await this.prisma.service.delete({ where: { id } });
      return this.createResponse('Service deleted successfully', deletedService);
    } catch (error) {
      throw new Error('Error deleting service: ' + error.message);
    }
  }
}
