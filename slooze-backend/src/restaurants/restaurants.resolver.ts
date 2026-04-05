import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantType } from './dto/restaurant.type';
import { MenuItemType } from './dto/menu-item.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver(() => RestaurantType)
@UseGuards(JwtAuthGuard)
export class RestaurantsResolver {
  constructor(private restaurantsService: RestaurantsService) {}

  @Query(() => [RestaurantType])
  async restaurants(@CurrentUser() user: User): Promise<RestaurantType[]> {
    return this.restaurantsService.findAll(user);
  }

  @Query(() => RestaurantType)
  async restaurant(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<RestaurantType> {
    return this.restaurantsService.findById(id, user);
  }

  @Query(() => [MenuItemType])
  async menuItems(
    @Args('restaurantId', { type: () => ID }) restaurantId: string,
    @CurrentUser() user: User,
  ): Promise<MenuItemType[]> {
    return this.restaurantsService.findMenuItems(restaurantId, user);
  }

  // Resolve menuItems field when querying restaurants
  @ResolveField('menuItems', () => [MenuItemType])
  async resolveMenuItems(
    @Parent() restaurant: RestaurantType,
    @CurrentUser() user: User,
  ): Promise<MenuItemType[]> {
    return this.restaurantsService.findMenuItems(restaurant.id, user);
  }
}
