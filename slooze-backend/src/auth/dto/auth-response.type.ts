import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { UserType } from '../../users/dto/user.type';

// Returned by verifyOtp and register — final JWT response
@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => UserType)
  user: UserType;
}

// Returned by the smart login mutation
// requiresOtp=false → accessToken + user populated
// requiresOtp=true  → userId + maskedEmail + message populated
@ObjectType()
export class LoginResult {
  @Field()
  requiresOtp: boolean;

  @Field(() => String, { nullable: true })
  accessToken?: string | null;

  @Field(() => UserType, { nullable: true })
  user?: UserType | null;

  @Field(() => String, { nullable: true })
  userId?: string | null;

  @Field(() => String, { nullable: true })
  maskedEmail?: string | null;

  @Field(() => String, { nullable: true })
  message?: string | null;
}

// Input for new user registration
@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  displayName: string;

  @Field()
  country: string; // 'INDIA' | 'AMERICA'
}
