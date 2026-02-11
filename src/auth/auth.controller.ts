import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterRequest } from './dto/register-request';
import { RegisterRequestSchema } from './dto/register-request';
import { ApiResponse } from '../common/dto/api-response';
import { UserResponse } from '../user/dto/user-response';
import { ZodValidationPipe } from '../common/pipe/zod-validation.pipe';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema))
    request: RegisterRequest,
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.authService.register(request);

    return ApiResponse.success(user, 'User registered', HttpStatus.CREATED);
  }
}
