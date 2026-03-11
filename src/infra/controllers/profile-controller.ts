import type { FastifyRequest, FastifyReply } from "fastify";

import { profileUseCase } from "../../app/use-cases/profile-usecase.js";
import { UserAlreadyExistError } from "../../app/errors/user-already-exist-error.js";

export async function profileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId } = request;

    const { user } = await profileUseCase({ userId });

    return reply.status(200).send({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof UserAlreadyExistError) {
      return reply.status(404).send({ message: error.message });
    }
  }
}
