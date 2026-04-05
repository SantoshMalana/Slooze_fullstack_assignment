import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, CountryCode } from '@prisma/client';
import { AddPaymentMethodInput } from './dto/add-payment-method.input';

type AuthUser = {
  id: string;
  role: Role;
  country: CountryCode;
};

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getMyPaymentMethods(user: AuthUser) {
    return this.prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' },
    });
  }

  /**
   * RBAC: Only Admin can add/modify payment methods.
   */
  async addPaymentMethod(input: AddPaymentMethodInput, user: AuthUser) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can add payment methods');
    }

    const targetUserId = input.targetUserId || user.id;

    // Validate target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) throw new NotFoundException('Target user not found');

    // Extract last 4 digits — never store full card
    const lastFourDigits = input.cardNumber.replace(/\s/g, '').slice(-4);

    // If this card is set as default, unset others
    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: targetUserId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.create({
      data: {
        type: input.type,
        cardholderName: input.cardholderName,
        lastFourDigits,
        expiryMonth: input.expiryMonth,
        expiryYear: input.expiryYear,
        isDefault: input.isDefault,
        userId: targetUserId,
      },
    });
  }

  async updatePaymentMethod(
    id: string,
    isDefault: boolean,
    user: AuthUser,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can modify payment methods');
    }

    const method = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Payment method not found');

    if (isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: method.userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isDefault },
    });
  }

  async deletePaymentMethod(id: string, user: AuthUser) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete payment methods');
    }

    const method = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Payment method not found');

    await this.prisma.paymentMethod.delete({ where: { id } });
    return true;
  }
}
