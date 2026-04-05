import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role, CountryCode } from '@prisma/client';

registerEnumType(Role, { name: 'Role' });
registerEnumType(CountryCode, { name: 'CountryCode' });

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  displayName: string;

  @Field(() => Role)
  role: Role;

  @Field(() => CountryCode)
  country: CountryCode;

  @Field()
  createdAt: Date;
}
