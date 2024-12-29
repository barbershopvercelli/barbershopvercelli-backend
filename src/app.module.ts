import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [AuthModule, ProfileModule, ServicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
