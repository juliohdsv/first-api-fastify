import type { FastifyInstance } from "fastify";

import { isAuth } from "../middlewares/isAuth.js";
import { profileController } from "../controllers/profile-controller.js";
import {
  profileSuccessResponseSchema,
  profileErrorResponseSchema,
} from "./schemas/profile-schema.js";

export function profileRoute(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: isAuth,
      schema: {
        summary: "Profile data user",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        response: {
          200: profileSuccessResponseSchema,
          404: profileErrorResponseSchema,
        },
      },
    },
    profileController,
  );
}
