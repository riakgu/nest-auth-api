import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.email().min(1).max(255),
  password: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
