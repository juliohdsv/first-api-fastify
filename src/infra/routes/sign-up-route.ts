import type { FastifyInstance } from "fastify";

import { signUpController } from "../controllers/sign-up-controller.js";

export function signUpRoute(app: FastifyInstance) {
  app.post("/sign-up", signUpController);
}
