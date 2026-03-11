import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { profileUseCase } from "../../app/use-cases/profile-usecase.js";
import { UserAlreadyExistError } from "../../app/errors/user-already-exist-error.js";

const schemaProfileRequestBody = z.object({
  userId: z.string().nonempty(),
});

export async function profileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId } = schemaProfileRequestBody.parse(request);

    const { user } = await profileUseCase({ userId });

    return reply.status(200).send(user);
  } catch (error) {
    if (error instanceof UserAlreadyExistError) {
      return reply.status(404).send({ message: error.message });
    }
  }
}
