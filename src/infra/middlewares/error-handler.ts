import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

export const configure = (app: FastifyInstance) => {
  app.setErrorHandler((error: Error, _, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Validation error",
        issues: error.format(),
      });
    }

    console.log(error);

    return reply.status(500).send({ message: "Internal server error." });
  });
};
