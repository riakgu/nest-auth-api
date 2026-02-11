export class ApiResponse<T> {
  statusCode: number;
  message?: string;
  data?: T;
  errors?: any;
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
    data: T,
    message?: string,
    statusCode?: number,
  ): ApiResponse<T> {
    return new ApiResponse<T>({
      message,
      data,
      statusCode,
    });
  }

  static error(
    errors: any,
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
