import type { FastifyInstance } from "fastify";

import { signInController } from "../controllers/sign-in-controller.js";

export function signInRoute(app: FastifyInstance) {
  app.post("/sign-in", signInController);
}
