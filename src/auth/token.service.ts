import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { RedisService } from '../common/service/redis.service';
import ms from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(userId: number): string {
    // @ts-ignore
    return this.jwtService.sign(
      { sub: userId, type: 'access' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE'),
      },
    );
  }

  generateRefreshToken(userId: number): string {
    // @ts-ignore
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
      },
    );
  }

  async storeRefreshToken(userId: number, token: string) {
    const key = `refresh_token:${userId}`;
    // @ts-ignore
    const ttl = ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000;
    return this.redisService.getClient().setex(key, ttl, token);
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
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
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);

    return this.generateAccessToken(payload.sub);
  }
}
