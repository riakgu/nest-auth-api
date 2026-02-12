import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/service/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async save(data: { email: string; name: string; password: string }) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
