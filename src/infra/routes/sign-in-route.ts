import type { FastifyInstance } from "fastify";

import { signInController } from "../controllers/sign-in-controller.js";
import {
  signInSchema,
  signInErrorResponseSchema,
  signInSuccessResponseSchema,
} from "./schemas/sign-in-schema.js";

export function signInRoute(app: FastifyInstance) {
  app.post(
    "/sign-in",
    {
      schema: {
        summary: "Login user",
        tags: ["Auth"],
        body: signInSchema,
        response: {
          200: signInSuccessResponseSchema,
          401: signInErrorResponseSchema,
        },
      },
    },
    signInController,
  );
}
