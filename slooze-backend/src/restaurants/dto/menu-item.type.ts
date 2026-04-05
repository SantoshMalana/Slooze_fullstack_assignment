import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class MenuItemType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  category: string;

  @Field()
  isAvailable: boolean;

  @Field()
  restaurantId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
