import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { CountryCode } from '@prisma/client';
import { MenuItemType } from './menu-item.type';

@ObjectType()
export class RestaurantType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  cuisine: string;

  @Field()
  address: string;

  @Field(() => CountryCode)
  country: CountryCode;

  @Field(() => [MenuItemType], { nullable: true })
  menuItems?: MenuItemType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
