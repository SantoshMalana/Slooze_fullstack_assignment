import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from '../../users/dto/user.type';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => UserType)
  user: UserType;
}
