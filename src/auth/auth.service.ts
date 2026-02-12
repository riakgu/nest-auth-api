import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserRepository } from '../user/user.repository';
import * as bcrypt from 'bcrypt';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshRequest,
} from './dto';
import { UserResponse } from '../user/dto';
import { JwtTokenService } from './jwt-token.service';
import { RefreshResponse } from './dto/refresh-response';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private userRepository: UserRepository,
    private jwtTokenService: JwtTokenService,
  ) {}

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const existingEmail = await this.userRepository.findUserByEmail(
      request.email,
    );

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const user = await this.userRepository.save({
      email: request.email,
      name: request.name,
      password: hashedPassword,
    });

    this.logger.info(`User registered with email: ${user.email}`);

    const accessToken = this.jwtTokenService.generateAccessToken(user.id);
    const refreshToken = this.jwtTokenService.generateRefreshToken(user.id);

    await this.jwtTokenService.storeRefreshToken(user.id, refreshToken);

    return new AuthResponse(
      UserResponse.fromUser(user),
      accessToken,
      refreshToken,
    );
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findUserByEmail(request.email);

    if (!user || !(await bcrypt.compare(request.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtTokenService.generateAccessToken(user.id);
    const refreshToken = this.jwtTokenService.generateRefreshToken(user.id);

    await this.jwtTokenService.storeRefreshToken(user.id, refreshToken);

    this.logger.info(`User login successfully with email: ${user.email}`);

    return new AuthResponse(
      UserResponse.fromUser(user),
      accessToken,
      refreshToken,
    );
  }

  async refresh(request: RefreshRequest): Promise<RefreshResponse> {
    const newAccessToken = await this.jwtTokenService.refreshAccessToken(
      request.refreshToken,
    );
    return new RefreshResponse(newAccessToken);
  }

  async logout(userId: number) {
    await this.jwtTokenService.revokeRefreshToken(userId);
  }
}
