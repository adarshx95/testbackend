import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Offer, OfferStatus } from '../entities/offer.entity';
import { OfferClick, ClickType } from '../entities/offer-click.entity';
import { User } from '../entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer)
    private offerModel: typeof Offer,
    @InjectModel(OfferClick)
    private offerClickModel: typeof OfferClick,
  ) {}

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
    return this.offerModel.create(createOfferDto as any);
  }

  async findAllOffers(status?: OfferStatus): Promise<Offer[]> {
    const whereCondition = status ? { status } : { status: OfferStatus.ACTIVE };
    return this.offerModel.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
    });
  }

  async findOfferById(id: string): Promise<Offer> {
    const offer = await this.offerModel.findByPk(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async updateOffer(id: string, updateData: Partial<CreateOfferDto>): Promise<Offer> {
    const offer = await this.findOfferById(id);
    await offer.update(updateData);
    return offer;
  }

  async deleteOffer(id: string): Promise<void> {
    const offer = await this.findOfferById(id);
    await offer.destroy();
  }

  async trackOfferClick(
    offerId: string,
    userId: string,
    clickType: ClickType,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const offer = await this.findOfferById(offerId);

    // Create click record
    await this.offerClickModel.create({
      offerId,
      userId,
      clickType,
      ipAddress,
      userAgent,
    } as any);

    // Update offer counters
    if (clickType === ClickType.VIEW) {
      offer.clickCount += 1;
    } else if (clickType === ClickType.APPLY) {
      offer.applicationCount += 1;
    }

    await offer.save();
  }

  async getOfferAnalytics(offerId: string) {
    const offer = await this.findOfferById(offerId);
    
    const analytics = await this.offerClickModel.findAll({
      where: { offerId },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const totalClicks = analytics.filter(click => click.clickType === ClickType.VIEW).length;
    const totalApplications = analytics.filter(click => click.clickType === ClickType.APPLY).length;
    const revenue = totalApplications * Number(offer.bonusAmount);

    return {
      offer,
      totalClicks,
      totalApplications,
      revenue,
      clickRate: totalClicks > 0 ? (totalApplications / totalClicks) * 100 : 0,
      recentActivity: analytics.slice(0, 10),
    };
  }

  async getUserOfferHistory(userId: string) {
    return this.offerClickModel.findAll({
      where: { userId },
      include: [
        {
          model: Offer,
          attributes: ['title', 'bankName', 'bonusAmount'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getAllOffersAnalytics() {
    const offers = await this.offerModel.findAll({
      include: [
        {
          model: OfferClick,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return offers.map(offer => {
      const clicks = offer.offerClicks.filter(click => click.clickType === ClickType.VIEW).length;
      const applications = offer.offerClicks.filter(click => click.clickType === ClickType.APPLY).length;
      const revenue = applications * Number(offer.bonusAmount);

      return {
        id: offer.id,
        title: offer.title,
        bankName: offer.bankName,
        bonusAmount: offer.bonusAmount,
        clicks,
        applications,
        revenue,
        clickRate: clicks > 0 ? (applications / clicks) * 100 : 0,
        status: offer.status,
        createdAt: offer.createdAt,
      };
    });
  }
}