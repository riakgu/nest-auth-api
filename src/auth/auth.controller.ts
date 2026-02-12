import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshRequest,
} from './dto';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  RefreshRequestSchema,
} from './dto';
import { ApiResponse } from '../common/dto/api-response';
import { ZodValidationPipe } from '../common/pipe/zod-validation.pipe';
import { RefreshResponse } from './dto/refresh-response';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema))
    request: RegisterRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    const auth = await this.authService.register(request);

    return ApiResponse.success(auth, 'User registered', HttpStatus.CREATED);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema))
    request: LoginRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    const auth = await this.authService.login(request);

    return ApiResponse.success(auth, 'User login successfully', HttpStatus.OK);
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(RefreshRequestSchema))
    request: RefreshRequest,
  ): Promise<ApiResponse<RefreshResponse>> {
    const refresh = await this.authService.refresh(request);

    return ApiResponse.success(refresh, 'User refresh token', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request) {
    await this.authService.logout(request.user.userId);

    return ApiResponse.success(
      undefined,
      'Logged out successfully',
      HttpStatus.OK,
    );
  }
}
