import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  menuItemId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  restaurantId: string;

  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}
