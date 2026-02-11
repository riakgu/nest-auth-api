import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [AuthService, TokenService],
  controllers: [AuthController],
})
export class AuthModule {}
