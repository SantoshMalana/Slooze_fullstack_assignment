import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Role, CountryCode } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt-payload.interface';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

function buildJwt(user: any, jwt: JwtService) {
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    country: user.country,
  };
  return jwt.sign(payload);
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private email: EmailService,
  ) {}

  /**
   * Smart login:
   *  - skipOtp = true  → return JWT immediately (seeded demo users)
   *  - skipOtp = false → send OTP email, return pending info
   */
  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    if (user.skipOtp) {
      // Demo / seeded users → direct JWT
      return {
        requiresOtp: false,
        accessToken: buildJwt(user, this.jwt),
        user,
        userId: null,
        maskedEmail: null,
        message: null,
      };
    }

    // New registered users → OTP flow
    await this.prisma.otpToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.otpToken.create({
      data: { token: otp, userId: user.id, expiresAt },
    });

    await this.email.sendOtpEmail(user.email, user.displayName, otp);

    const masked = maskEmail(user.email);
    return {
      requiresOtp: true,
      accessToken: null,
      user: null,
      userId: user.id,
      maskedEmail: masked,
      message: `OTP sent to ${masked}`,
    };
  }

  /**
   * Verify OTP for registered users → return JWT
   */
  async verifyOtp(userId: string, otp: string) {
    const otpRecord = await this.prisma.otpToken.findFirst({
      where: { userId, token: otp, used: false, expiresAt: { gt: new Date() } },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP. Please try again.');
    }

    await this.prisma.otpToken.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    return {
      accessToken: buildJwt(user, this.jwt),
      user,
    };
  }

  /**
   * Register a new user (MEMBER role, OTP required on login)
   */
  async register(input: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    country: CountryCode;
  }) {
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: input.username },
    });
    if (existingUsername) throw new ConflictException('Username already taken');

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashedPassword,
        displayName: input.displayName,
        role: Role.MEMBER,
        country: input.country,
        skipOtp: false, // New users must verify via OTP on every login
      },
    });

    return {
      accessToken: buildJwt(user, this.jwt),
      user,
    };
  }
}
