import { prisma } from "../src/lib/prisma/prisma";
import { createFakeUser } from "./seeds/create-faker-user-seed";

async function runSeeds() {
  try {
    await prisma.$connect();

    await createFakeUser();

    console.log("Seeds executados com sucesso!");
  } catch (error) {
    console.error("Não foi possível rodar seeds.", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

await runSeeds();
