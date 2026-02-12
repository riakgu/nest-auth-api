import { Global, Module } from '@nestjs/common';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './service/prisma.service';
import { RedisService } from './service/redis.service';
import { GlobalExceptionFilter } from './filter/http-exception.filter';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PrismaService, RedisService, GlobalExceptionFilter],
  exports: [PrismaService, RedisService, GlobalExceptionFilter],
})
export class CommonModule { }
