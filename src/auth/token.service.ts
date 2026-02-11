import { Inject, Injectable } from '@nestjs/common';
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
}
