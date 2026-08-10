import type { FastifyRequest } from "fastify";

import { ForbiddenError } from "../../app/errors/forbidden-error.js";

export function isAuthorized(roles: string[]) {
  return async (request: FastifyRequest): Promise<void> => {
    const { role } = request;

    if (!role || !roles.includes(role)) {
      throw new ForbiddenError();
    }
  };
}
