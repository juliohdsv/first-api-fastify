import type { FastifyRequest } from "fastify";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { UnauthorizedError } from "../../app/errors/unauthorized-error.js";

interface TokenPayload extends JwtPayload {
  sub: string;
}

export async function isAuth(request: FastifyRequest) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError();
    }

    const [_, token] = authHeader.split(" ");
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const { sub } = jwt.verify(String(token), JWT_SECRET) as TokenPayload;

    request.userId = sub;
  } catch (error) {
    throw error;
  }
}
