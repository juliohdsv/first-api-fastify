import type { FastifyRequest, FastifyReply } from "fastify";

import { signUpUseCase } from "../../app/use-cases/sign-up-usecase.js";
import { UserAlreadyExistError } from "../../app/errors/user-already-exist-error.js";
import type { SignUpBodySchema } from "../routes/schemas/sign-up-schema.js";

export async function signUpController(
  request: FastifyRequest<{ Body: SignUpBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { name, email, password } = request.body;

    await signUpUseCase({ name, email, password });

    return reply.status(201).send();
  } catch (error) {
    if (error instanceof UserAlreadyExistError) {
      return reply.status(409).send({ message: error.message });
    }
  }
}
