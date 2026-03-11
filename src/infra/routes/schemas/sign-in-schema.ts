import z from "zod";

export const signInSchema = z.object({
  email: z.email("Email required."),
  password: z
    .string("password required.")
    .min(3, "password must be at least 3 characters long."),
});

export const signInSuccessResponseSchema = z.object({
  user: z.object({
    email: z.string(),
  }),
  token: z.string(),
});

export const signInErrorResponseSchema = z.object({
  message: z.string(),
});

export type SignInBodySchema = z.infer<typeof signInSchema>;
