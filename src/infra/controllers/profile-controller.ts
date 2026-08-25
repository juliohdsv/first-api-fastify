import type { FastifyRequest, FastifyReply } from "fastify";

import { profileUseCase } from "../../app/use-cases/profile-usecase.js";
import { UserNotFoundError } from "../../app/errors/user-not-found-error.js";

export async function profileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId } = request;

    const { user } = await profileUseCase({ userId });

    return reply.status(200).send({
      user,
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      });
    }

    throw error;
  }
}
