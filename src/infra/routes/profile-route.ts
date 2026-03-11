import type { FastifyInstance } from "fastify";

import { profileController } from "../controllers/profile-controller.js";
import { isAuth } from "../middlewares/isAuth.js";

export function profileRoute(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: isAuth,
    },
    profileController,
  );
}
