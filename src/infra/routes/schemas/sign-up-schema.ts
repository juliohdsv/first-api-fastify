import z from "zod";

export const signUpSchema = z.object({
  name: z.string("Name required."),
  email: z.email("Email required."),
  password: z
    .string("password required.")
    .min(3, "password must be at least 3 characters long."),
});

export const signIUpuccessResponseSchema = z.void();

export const signUpErrorResponseSchema = z.object({
  message: z.string(),
});

export type SignUpBodySchema = z.infer<typeof signUpSchema>;
