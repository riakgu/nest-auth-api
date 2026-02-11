import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/service/prisma.service';
import { UserResponse } from './dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async save(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<UserResponse> {
    const user = await this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });
    return UserResponse.fromUser(user);
  }
}
