import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { signUpUseCase } from "../../app/use-cases/sign-up-usecase.js";
import { UserAlreadyExistError } from "../../app/errors/user-already-exist-error.js";

const schemaSignUpRequestBody = z.object({
  name: z.string("Name required."),
  email: z.email("Email required."),
  password: z
    .string("password required.")
    .min(3, "password must be at least 3 characters long."),
});

export async function signUpController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { name, email, password } = schemaSignUpRequestBody.parse(
      request.body,
    );

    await signUpUseCase({ name, email, password });

    return reply.status(201).send();
  } catch (error) {
    if (error instanceof UserAlreadyExistError) {
      return reply.status(409).send({ message: error.message });
    }
  }
}
