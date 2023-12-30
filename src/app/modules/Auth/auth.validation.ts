import { z } from 'zod';

const userRegistrationValidationSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'username is required.' }),
    email: z.string({ required_error: 'email is required.' }).email(),
    password: z.string({ required_error: 'Password is required' }),
    role: z.enum(['user', 'admin']).default('user'),
  }),
});

const userLoginValidationSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'username is required.' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const userChangePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current password is required',
    }),
    newPassword: z.string({ required_error: 'New password is required' }),
  }),
});

export const userValidations = {
  userRegistrationValidationSchema,
  userLoginValidationSchema,
  userChangePasswordValidationSchema,
};
