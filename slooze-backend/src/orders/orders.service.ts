import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, CountryCode, OrderStatus } from '@prisma/client';
import { CreateOrderInput } from './dto/create-order.input';

type AuthUser = {
  id: string;
  role: Role;
  country: CountryCode;
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * ReBAC: Users see only their own orders.
   * Admin sees all orders across all countries.
   */
  async findMyOrders(user: AuthUser) {
    const where = user.role === Role.ADMIN ? {} : { userId: user.id };

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: { include: { menuItem: true } },
        restaurant: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, user: AuthUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { menuItem: true } },
        restaurant: true,
        payment: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Non-admin can only see their own orders
    if (user.role !== Role.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async createOrder(input: CreateOrderInput, user: AuthUser) {
    const { restaurantId, items } = input;

    // Validate restaurant exists and belongs to user's country
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) throw new NotFoundException('Restaurant not found');

    // ReBAC: Non-admin cannot order from another country's restaurant
    if (user.role !== Role.ADMIN && restaurant.country !== user.country) {
      throw new ForbiddenException('You can only order from restaurants in your country');
    }

    // Validate all menu items exist and belong to this restaurant
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, restaurantId, isAvailable: true },
    });

    if (menuItems.length !== items.length) {
      throw new BadRequestException('One or more menu items are invalid or unavailable');
    }

    // Build order items with price snapshot
    const orderItemsData = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price * item.quantity,
      };
    });

    const totalAmount = orderItemsData.reduce((sum, item) => sum + item.price, 0);

    return this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        totalAmount,
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: { include: { menuItem: true } },
        restaurant: true,
      },
    });
  }

  /**
   * RBAC: Only Admin + Manager can checkout.
   * ReBAC: Manager can only checkout orders belonging to their country's users.
   */
  async checkoutOrder(orderId: string, paymentMethodId: string, user: AuthUser) {
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('Members cannot checkout orders');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.CREATED) {
      throw new BadRequestException(`Order is already ${order.status.toLowerCase()}`);
    }

    // ReBAC: Manager can only checkout orders from their country
    if (user.role === Role.MANAGER && order.restaurant.country !== user.country) {
      throw new ForbiddenException('You can only manage orders in your country');
    }

    // Validate payment method belongs to the order's user
    const payment = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId: order.userId },
    });

    if (!payment) throw new NotFoundException('Payment method not found');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID, paymentId: paymentMethodId },
      include: {
        orderItems: { include: { menuItem: true } },
        restaurant: true,
        payment: true,
      },
    });
  }

  /**
   * RBAC: Only Admin + Manager can cancel.
   * ReBAC: Manager can only cancel orders in their country.
   */
  async cancelOrder(orderId: string, user: AuthUser) {
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('Members cannot cancel orders');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid order');
    }

    // ReBAC: Manager can only cancel orders from their country
    if (user.role === Role.MANAGER && order.restaurant.country !== user.country) {
      throw new ForbiddenException('You can only manage orders in your country');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: {
        orderItems: { include: { menuItem: true } },
        restaurant: true,
        payment: true,
      },
    });
  }
}
