import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { OffersService } from '../offers/offers.service';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private offersService: OffersService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get all offers analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Analytics for all offers',
    schema: {
      example: [
        {
          id: 'uuid',
          title: 'Chase Sapphire Preferred',
          bankName: 'Chase',
          bonusAmount: 600,
          clicks: 150,
          applications: 25,
          revenue: 15000,
          clickRate: 16.67,
          status: 'active',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  async getAllAnalytics() {
    return this.offersService.getAllOffersAnalytics();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard data (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary and analytics',
    schema: {
      example: {
        summary: {
          totalOffers: 10,
          totalClicks: 1500,
          totalApplications: 250,
          totalRevenue: 150000,
          avgClickRate: 16.67,
        },
        offers: [],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  async getDashboard() {
    const analytics = await this.offersService.getAllOffersAnalytics();
    
    const totalOffers = analytics.length;
    const totalClicks = analytics.reduce((sum, offer) => sum + offer.clicks, 0);
    const totalApplications = analytics.reduce((sum, offer) => sum + offer.applications, 0);
    const totalRevenue = analytics.reduce((sum, offer) => sum + offer.revenue, 0);
    const avgClickRate = analytics.length > 0 
      ? analytics.reduce((sum, offer) => sum + offer.clickRate, 0) / analytics.length 
      : 0;

    return {
      summary: {
        totalOffers,
        totalClicks,
        totalApplications,
        totalRevenue,
        avgClickRate: Math.round(avgClickRate * 100) / 100,
      },
      offers: analytics,
    };
  }
}