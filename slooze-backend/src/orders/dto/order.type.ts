import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '@prisma/client';
import { MenuItemType } from '../../restaurants/dto/menu-item.type';

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field()
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field()
  menuItemId: string;

  @Field()
  orderId: string;

  @Field(() => MenuItemType, { nullable: true })
  menuItem?: MenuItemType;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  totalAmount: number;

  @Field()
  userId: string;

  @Field()
  restaurantId: string;

  @Field({ nullable: true })
  paymentId?: string;

  @Field(() => [OrderItemType], { nullable: true })
  orderItems?: OrderItemType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
