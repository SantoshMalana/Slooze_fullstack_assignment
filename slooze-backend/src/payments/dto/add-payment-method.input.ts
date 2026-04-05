import { InputType, Field, Int } from '@nestjs/graphql';
import { PaymentType } from '@prisma/client';

@InputType()
export class AddPaymentMethodInput {
  @Field(() => PaymentType)
  type: PaymentType;

  @Field()
  cardholderName: string;

  // Frontend sends full card number — we store only last 4
  @Field()
  cardNumber: string;

  @Field(() => Int)
  expiryMonth: number;

  @Field(() => Int)
  expiryYear: number;

  @Field({ defaultValue: false })
  isDefault: boolean;

  // Admin can add payment method for any user
  @Field({ nullable: true })
  targetUserId?: string;
}
