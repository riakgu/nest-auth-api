import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterRequest, LoginRequest, AuthResponse } from './dto';
import { RegisterRequestSchema, LoginRequestSchema } from './dto';
import { ApiResponse } from '../common/dto/api-response';
import { ZodValidationPipe } from '../common/pipe/zod-validation.pipe';

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
}
