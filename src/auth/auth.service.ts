import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserRepository } from '../user/user.repository';
import * as bcrypt from 'bcrypt';
import { RegisterRequest } from './dto/register-request';
import { UserResponse } from '../user/dto/user-response';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private userRepository: UserRepository,
  ) {}

  async register(request: RegisterRequest): Promise<UserResponse> {
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

    return user;
  }
}
