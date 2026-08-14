import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    orgName: z.string().min(2, 'Organization name must be at least 2 characters long'),
    orgSlug: z
      .string()
      .min(2, 'Organization slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Org slug must be lowercase alphanumeric with hyphens'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    orgSlug: z.string().min(1, 'Organization slug is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
