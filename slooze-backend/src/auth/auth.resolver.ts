import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse, LoginResult, RegisterInput } from './dto/auth-response.type';
import { CountryCode } from '@prisma/client';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  /**
   * Smart login:
   * Demo users  → requiresOtp:false, accessToken + user
   * New users   → requiresOtp:true,  userId + maskedEmail + message
   */
  @Mutation(() => LoginResult)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ) {
    return this.authService.login(username, password);
  }

  /** Step 2 for OTP users — returns final JWT */
  @Mutation(() => AuthResponse)
  async verifyOtp(
    @Args('userId') userId: string,
    @Args('otp') otp: string,
  ) {
    return this.authService.verifyOtp(userId, otp);
  }

  /** Register a new account (MEMBER role, OTP required on login) */
  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput) {
    return this.authService.register({
      ...input,
      country: input.country as CountryCode,
    });
  }
}
