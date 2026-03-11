import z from "zod";

export const profileSuccessResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.string(),
  }),
});

export const profileErrorResponseSchema = z.object({
  message: z.string(),
});
