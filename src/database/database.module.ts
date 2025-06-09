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
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        return {
          dialect: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '5432'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          models: [User, Offer, OfferClick],
          autoLoadModels: true,
          synchronize: !isProduction, // Only sync in development
          logging: !isProduction,
          ...(isProduction && {
            dialectOptions: {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            },
          }),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}