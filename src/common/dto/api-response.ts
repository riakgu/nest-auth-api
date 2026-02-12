import { HttpStatus } from '@nestjs/common';

export class ApiResponse<T> {
  statusCode: number;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  pagination?: {
    page?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    last?: boolean;
  };

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
  }

  static success<T>(
    data?: T,
    message?: string,
    statusCode?: number,
  ): ApiResponse<T> {
    return new ApiResponse<T>({
      message,
      data,
      statusCode,
    });
  }

  static message(
    message: string,
    statusCode: number = HttpStatus.OK,
  ): ApiResponse<null> {
    return new ApiResponse<null>({
      message,
      statusCode,
    });
  }

  static error(
    errors?: Record<string, string>,
    message?: string,
    statusCode?: number,
  ): ApiResponse<null> {
    return new ApiResponse<null>({
      message,
      errors,
      statusCode,
    });
  }

  static paginated<T>(
    data: T,
    page: number,
    size: number,
    totalElements: number,
    totalPages: number,
    last: boolean,
  ): ApiResponse<T> {
    return new ApiResponse<T>({
      data,
      pagination: {
        page: page,
        size: size,
        totalElements: totalElements,
        totalPages: totalPages,
        last: last,
      },
    });
  }
}
