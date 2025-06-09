import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferStatus } from '../../entities/offer.entity';

export class CreateOfferDto {
  @ApiProperty({
    description: 'Offer title',
    example: 'Chase Sapphire Preferred Card',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the offer',
    example: 'Earn 60,000 bonus points after spending $4,000 in first 3 months',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'Chase',
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    description: 'Bonus amount in USD',
    example: 600,
  })
  @IsNumber()
  bonusAmount: number;

  @ApiProperty({
    description: 'Requirements to get the bonus',
    example: 'Spend $4,000 in first 3 months',
  })
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @ApiPropertyOptional({
    description: 'URL to offer image',
    example: 'https://example.com/card-image.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'URL to apply for the offer',
    example: 'https://chase.com/apply/sapphire-preferred',
  })
  @IsUrl()
  applicationUrl: string;

  @ApiPropertyOptional({
    description: 'Offer status',
    enum: OfferStatus,
    example: OfferStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiPropertyOptional({
    description: 'Offer expiry date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}