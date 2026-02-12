import type { User } from '../../../prisma/generated/client';

type UserWithoutPassword = Omit<User, 'password'>;

export class UserResponse {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: UserWithoutPassword) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.createdAt = user.created_at;
    this.updatedAt = user.updated_at;
  }

  static fromUser(user: UserWithoutPassword) {
    return new UserResponse(user);
  }
}
