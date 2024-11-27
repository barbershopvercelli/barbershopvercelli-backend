import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Makes config globally available
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
})
export class ProfileModule {}
