import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ForbiddenError } from "../../app/errors/forbidden-error.js";

export const configure = (app: FastifyInstance) => {
  app.setErrorHandler((error: Error, _, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Validation error",
        issues: error.format(),
      });
    }

    if (error instanceof ForbiddenError) {
      return reply.status(403).send({ message: error.message });
    }

    console.log(error);

    return reply.status(500).send({ message: "Internal server error." });
  });
};
