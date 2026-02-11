import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.email().min(1).max(255),
  password: z.string().min(1).max(255),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
