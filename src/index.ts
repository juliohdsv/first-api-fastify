import fastify from "fastify";
import cors from "@fastify/cors";

import { profileRoute } from "./infra/routes/profile-route.js";
import { signInRoute } from "./infra/routes/sign-in-route.js";
import { signUpRoute } from "./infra/routes/sign-up-route.js";

import * as ErrorHandler from "./infra/middlewares/error-handler.js";

const app = fastify();

app.register(cors, { origin: "*" });

app.register(signUpRoute);
app.register(signInRoute);
app.register(profileRoute);

ErrorHandler.configure(app);

app.listen({ port: 3333, host: "0.0.0.0" }, () =>
  console.log("Server running in dev mode."),
);
