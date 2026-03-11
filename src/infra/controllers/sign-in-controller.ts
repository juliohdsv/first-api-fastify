import type { FastifyRequest, FastifyReply } from "fastify";

import { signInUseCase } from "../../app/use-cases/sign-in-usecase.js";
import { UnauthorizedError } from "../../app/errors/unauthorized-error.js";
import { type SignInBodySchema } from "../routes/schemas/sign-in-schema.js";

export async function signInController(
  request: FastifyRequest<{ Body: SignInBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { email, password } = request.body;

    const data = await signInUseCase({ email, password });

    return reply.status(200).send(data);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    }
  }
}
