import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderType } from './dto/order.type';
import { CreateOrderInput } from './dto/create-order.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver(() => OrderType)
@UseGuards(JwtAuthGuard)
export class OrdersResolver {
  constructor(private ordersService: OrdersService) {}

  @Query(() => [OrderType])
  async myOrders(@CurrentUser() user: User) {
    return this.ordersService.findMyOrders(user);
  }

  @Query(() => OrderType)
  async order(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.findById(id, user);
  }

  @Mutation(() => OrderType)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.createOrder(input, user);
  }

  @Mutation(() => OrderType)
  async checkoutOrder(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('paymentMethodId', { type: () => ID }) paymentMethodId: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.checkoutOrder(orderId, paymentMethodId, user);
  }

  @Mutation(() => OrderType)
  async cancelOrder(
    @Args('orderId', { type: () => ID }) orderId: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.cancelOrder(orderId, user);
  }
}
