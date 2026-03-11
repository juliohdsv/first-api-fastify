import type { FastifyInstance } from "fastify";

import { signUpController } from "../controllers/sign-up-controller.js";
import {
  signIUpuccessResponseSchema,
  signUpErrorResponseSchema,
  signUpSchema,
} from "./schemas/sign-up-schema.js";

export function signUpRoute(app: FastifyInstance) {
  app.post(
    "/sign-up",
    {
      schema: {
        summary: "Create a user",
        tags: ["Auth"],
        body: signUpSchema,
        response: {
          201: signIUpuccessResponseSchema,
          409: signUpErrorResponseSchema,
        },
      },
    },
    signUpController,
  );
}
