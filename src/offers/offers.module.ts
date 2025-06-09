import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer } from '../entities/offer.entity';
import { OfferClick } from '../entities/offer-click.entity';

@Module({
  imports: [SequelizeModule.forFeature([Offer, OfferClick])],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}