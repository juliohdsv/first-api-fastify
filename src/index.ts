import fastify from "fastify";
import cors from "@fastify/cors";
import Swagger from "@fastify/swagger";
import SwaggerUi from "@fastify/swagger-ui";
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { profileRoute } from "./infra/routes/profile-route.js";
import { signInRoute } from "./infra/routes/sign-in-route.js";
import { signUpRoute } from "./infra/routes/sign-up-route.js";

import * as ErrorHandler from "./infra/middlewares/error-handler.js";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, { origin: "*" });

app.register(Swagger, {
  openapi: {
    info: {
      title: "First API",
      description: "Documentação da API utilizando Fastify",
      version: "1.0.0",
    },
    tags: [{ name: "Auth" }, { name: "User" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(SwaggerUi, {
  routePrefix: "/docs",
});

app.register(signUpRoute);
app.register(signInRoute);
app.register(profileRoute);

ErrorHandler.configure(app);

app.listen({ port: 3333, host: "0.0.0.0" }, () =>
  console.log("Server running in dev mode."),
);
