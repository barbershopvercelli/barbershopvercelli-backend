import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ServicesModule } from './services/services.module';
import { PaymentsModule } from './payments/payments.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BranchesModule } from './branches/branches.module';

@Module({
  imports: [AuthModule, ProfileModule, ServicesModule, PaymentsModule, AppointmentsModule, BranchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
