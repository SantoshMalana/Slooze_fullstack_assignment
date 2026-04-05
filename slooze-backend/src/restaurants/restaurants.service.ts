import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CountryCode, Role } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  /**
   * ReBAC: Admin sees all restaurants.
   * Manager/Member see only their country's restaurants.
   */
  async findAll(user: { role: Role; country: CountryCode }) {
    const where = user.role === Role.ADMIN ? {} : { country: user.country };

    return this.prisma.restaurant.findMany({
      where,
      include: { menuItems: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, user: { role: Role; country: CountryCode }) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });

    if (!restaurant) throw new NotFoundException('Restaurant not found');

    // ReBAC check — non-admin cannot access other country's restaurant
    if (user.role !== Role.ADMIN && restaurant.country !== user.country) {
      throw new ForbiddenException('You cannot access restaurants outside your country');
    }

    return restaurant;
  }

  async findMenuItems(restaurantId: string, user: { role: Role; country: CountryCode }) {
    // Validate access to this restaurant first
    await this.findById(restaurantId, user);

    return this.prisma.menuItem.findMany({
      where: { restaurantId, isAvailable: true },
      orderBy: { category: 'asc' },
    });
  }

  async findMenuItemById(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }
}
