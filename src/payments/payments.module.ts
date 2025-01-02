import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, ConfigService],
})
export class PaymentsModule {}
