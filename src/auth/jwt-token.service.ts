import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { RedisService } from '../common/service/redis.service';
import ms, { type StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: number;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtTokenService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(userId: number): string {
    return this.jwtService.sign({ sub: userId, type: 'access' } as JwtPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow(
        'JWT_ACCESS_EXPIRE',
      ) as StringValue,
    });
  }

  generateRefreshToken(userId: number): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' } as JwtPayload,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'JWT_REFRESH_EXPIRE',
        ) as StringValue,
      },
    );
  }

  async storeRefreshToken(userId: number, token: string) {
    const key = `refresh_token:${userId}`;
    const expireValue =
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRE');
    const ttl = ms(expireValue as StringValue) / 1000;
    return this.redisService.getClient().setex(key, ttl, token);
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const stored = await this.redisService
        .getClient()
        .get(`refresh_token:${payload.sub}`);

      if (stored !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async generateTokens(userId: number): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    await this.storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async revokeRefreshToken(userId: number) {
    await this.redisService.getClient().del(`refresh_token:${userId}`);
  }
}
