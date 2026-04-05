import { Role, CountryCode } from '@prisma/client';

export interface JwtPayload {
  sub: string;       // user id
  username: string;
  role: Role;
  country: CountryCode;
}
