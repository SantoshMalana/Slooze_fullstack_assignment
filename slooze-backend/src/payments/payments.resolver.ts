import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentMethodType } from './dto/payment-method.type';
import { AddPaymentMethodInput } from './dto/add-payment-method.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, User } from '@prisma/client';

@Resolver(() => PaymentMethodType)
@UseGuards(JwtAuthGuard)
export class PaymentsResolver {
  constructor(private paymentsService: PaymentsService) {}

  @Query(() => [PaymentMethodType])
  async myPaymentMethods(@CurrentUser() user: User): Promise<PaymentMethodType[]> {
    return this.paymentsService.getMyPaymentMethods(user);
  }

  // Admin only
  @Mutation(() => PaymentMethodType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addPaymentMethod(
    @Args('input') input: AddPaymentMethodInput,
    @CurrentUser() user: User,
  ): Promise<PaymentMethodType> {
    return this.paymentsService.addPaymentMethod(input, user);
  }

  // Admin only
  @Mutation(() => PaymentMethodType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updatePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
    @Args('isDefault') isDefault: boolean,
    @CurrentUser() user: User,
  ): Promise<PaymentMethodType> {
    return this.paymentsService.updatePaymentMethod(id, isDefault, user);
  }

  // Admin only
  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deletePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.paymentsService.deletePaymentMethod(id, user);
  }
}
