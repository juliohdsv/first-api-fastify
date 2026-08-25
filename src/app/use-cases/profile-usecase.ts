import { redis } from "../../lib/cache/redis.js";
import { prisma } from "../../lib/prisma/prisma.js";
import { UserNotFoundError } from "../errors/user-not-found-error.js";

interface IProfileUseCaseRequest {
  userId: string;
}

interface IProfileUseCaseResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export async function profileUseCase({
  userId,
}: IProfileUseCaseRequest): Promise<IProfileUseCaseResponse> {
  let cachedUser: string | null = null;

  try {
    cachedUser = await redis.get(`user:${userId}`);
  } catch (error) {
    console.error("Redis GET failed", error);
  }

  if (cachedUser) {
    return {
      user: JSON.parse(cachedUser),
    };
  }

  const userExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userExist) {
    throw new UserNotFoundError();
  }

  const user = {
    id: userExist.id,
    name: userExist.name,
    email: userExist.email,
    createdAt: String(userExist.createdAt),
  };

  try {
    await redis.set(`user:${userId}`, JSON.stringify(user), {
      EX: 60 * 5,
    });
  } catch (error) {
    console.error("Redis SET failed", error);
  }

  return {
    user,
  };
}
