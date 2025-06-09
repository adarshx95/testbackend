import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { OffersModule } from '../offers/offers.module';

@Module({
  imports: [OffersModule],
  controllers: [AdminController],
})
export class AdminModule {}