import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { PaymentType } from '@prisma/client';

registerEnumType(PaymentType, { name: 'PaymentType' });

@ObjectType()
export class PaymentMethodType {
  @Field(() => ID)
  id: string;

  @Field(() => PaymentType)
  type: PaymentType;

  @Field()
  cardholderName: string;

  @Field()
  lastFourDigits: string;

  @Field(() => Int)
  expiryMonth: number;

  @Field(() => Int)
  expiryYear: number;

  @Field()
  isDefault: boolean;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
