import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Offer } from '../entities/offer.entity';
import { OfferClick } from '../entities/offer-click.entity';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        models: [User, Offer, OfferClick],
        autoLoadModels: true,
        synchronize: configService.get('NODE_ENV') === 'development', // Only sync in development
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        dialectOptions: configService.get('NODE_ENV') === 'production' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        } : {},
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}