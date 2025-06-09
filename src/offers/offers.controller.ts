import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../entities/user.entity';
import { OfferStatus } from '../entities/offer.entity';
import { ClickType } from '../entities/offer-click.entity';
import { User } from '../entities/user.entity';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all offers' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OfferStatus,
    description: 'Filter offers by status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of offers',
    schema: {
      example: [
        {
          id: 'uuid',
          title: 'Chase Sapphire Preferred',
          description: 'Earn 60,000 bonus points',
          bankName: 'Chase',
          bonusAmount: 600,
          requirements: 'Spend $4,000 in first 3 months',
          applicationUrl: 'https://chase.com/apply',
          status: 'active',
          clickCount: 150,
          applicationCount: 25,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  async findAll(@Query('status') status?: OfferStatus) {
    return this.offersService.findAllOffers(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: 200, description: 'Offer details' })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  async findOne(@Param('id') id: string) {
    return this.offersService.findOfferById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new offer (Admin only)' })
  @ApiBody({ type: CreateOfferDto })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createOfferDto: CreateOfferDto) {
    return this.offersService.createOffer(createOfferDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update offer (Admin only)' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiBody({ type: CreateOfferDto })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: Partial<CreateOfferDto>,
  ) {
    return this.offersService.updateOffer(id, updateOfferDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete offer (Admin only)' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Offer deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.offersService.deleteOffer(id);
    return { message: 'Offer deleted successfully' };
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Track offer click' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        clickType: {
          type: 'string',
          enum: Object.values(ClickType),
          example: 'view',
        },
      },
    },
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 201, description: 'Click tracked successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @UseGuards(JwtAuthGuard)
  async trackClick(
    @Param('id') offerId: string,
    @CurrentUser() user: User,
    @Body('clickType') clickType: ClickType,
    @Req() req: Request,
  ) {
    await this.offersService.trackOfferClick(
      offerId,
      user.id,
      clickType,
      req.ip,
      req.get('User-Agent'),
    );
    return { message: 'Click tracked successfully' };
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get offer analytics (Admin only)' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Offer analytics',
    schema: {
      example: {
        offer: {},
        totalClicks: 150,
        totalApplications: 25,
        revenue: 15000,
        clickRate: 16.67,
        recentActivity: [],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAnalytics(@Param('id') id: string) {
    return this.offersService.getOfferAnalytics(id);
  }

  @Get('user/history')
  @ApiOperation({ summary: 'Get user offer history' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User offer history',
    schema: {
      example: [
        {
          id: 'uuid',
          clickType: 'view',
          createdAt: '2024-01-01T00:00:00.000Z',
          offer: {
            title: 'Chase Sapphire Preferred',
            bankName: 'Chase',
            bonusAmount: 600,
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  async getUserHistory(@CurrentUser() user: User) {
    return this.offersService.getUserOfferHistory(user.id);
  }
}