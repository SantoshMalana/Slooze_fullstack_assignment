import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserType } from './dto/user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  // Admin only — view all users
  @Query(() => [UserType])
  @Roles(Role.ADMIN)
  async users() {
    return this.usersService.findAll();
  }
}
