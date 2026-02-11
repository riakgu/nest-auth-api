import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};

        error.issues.forEach((issue) => {
          const field = issue.path.join('.');
          formattedErrors[field] = issue.message;
        });

        throw new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      throw new BadRequestException('Validation failed');
    }
  }
}
