import fs from "node:fs";
import path from "node:path";

import { prisma } from "../../src/lib/prisma/prisma.js";

export async function createFakeUser() {
  const filePath = path.resolve(process.cwd(), "usuarios_10000.json");

  const rawData = fs.readFileSync(filePath, "utf-8");
  const allUsers = JSON.parse(rawData); // Array com os 30.000 usuários

  const total = allUsers.length;
  const BATCH_SIZE = 5000; // Inserir de 5k em 5k é o ideal para o Prisma

  console.log(`Iniciando inserção de ${total} usuários no banco...`);

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = allUsers.slice(i, i + BATCH_SIZE);

    const dataToInsert = batch.map((user: any) => ({
      name: user.name,
      email: user.email,
      password: user.password,
      role: "USER",
    }));

    await prisma.user.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    process.stdout.write(
      `\rProgresso: ${Math.min(i + BATCH_SIZE, total)}/${total} inseridos.`,
    );
  }

  console.log("\nTodos os usuários foram importados com sucesso!");
}
