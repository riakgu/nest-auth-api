export class UserResponse {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.createdAt = user.created_at;
    this.updatedAt = user.updated_at;
  }

  static fromUser(user) {
    return new UserResponse(user);
  }
}
