import { UserResponse } from '../../user/dto/user-response';

export class AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;

  constructor(user: UserResponse, accessToken: string, refreshToken: string) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
