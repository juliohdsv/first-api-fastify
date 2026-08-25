import { randomUUID } from "node:crypto";

const BASE_URL = "http://localhost:3333";

const TOTAL_REQUESTS = 1000;
const SIGNUP_CONCURRENCY = 500;

const PASSWORD = "123456";
const ROLE = "USER";

function createFakeUser(index) {
  const id = randomUUID();

  return {
    name: `Load Test ${index}`,
    email: `load-${id}@gmail.com`,
    password: PASSWORD,
    role: ROLE,
  };
}

async function request(url, options = {}) {
  const start = performance.now();

  try {
    const response = await fetch(url, options);

    let body = null;

    try {
      body = await response.json();
    } catch {
      // Resposta sem JSON
    }

    return {
      ok: response.ok,
      status: response.status,
      body,
      duration: performance.now() - start,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: null,
      duration: performance.now() - start,
      error: error.message,
    };
  }
}

function printResult(result) {
  console.log(`Total:       ${result.total}`);
  console.log(`Sucesso:     ${result.success}`);
  console.log(`Falhas:      ${result.failures}`);
  console.log(`Tempo total: ${result.totalTime.toFixed(2)} ms`);
  console.log(`Média:       ${result.average.toFixed(2)} ms`);
}

async function runConcurrentRequests(total, requestFn) {
  const start = performance.now();

  const promises = Array.from({ length: total }, (_, index) =>
    requestFn(index),
  );

  const results = await Promise.all(promises);

  const totalTime = performance.now() - start;

  const success = results.filter((result) => result.ok).length;
  const failures = results.length - success;

  const average =
    results.length > 0
      ? results.reduce((sum, result) => sum + result.duration, 0) /
        results.length
      : 0;

  return {
    total: results.length,
    success,
    failures,
    totalTime,
    average,
    results,
  };
}

async function createUsers(total) {
  console.log(`Criando ${total} usuários...`);

  const users = [];

  let created = 0;

  while (created < total) {
    const batchSize = Math.min(SIGNUP_CONCURRENCY, total - created);

    const batch = Array.from({ length: batchSize }, (_, index) =>
      createFakeUser(created + index),
    );

    const results = await Promise.all(
      batch.map(async (user) => {
        const result = await request(`${BASE_URL}/sign-up`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });

        return {
          user,
          result,
        };
      }),
    );

    for (const { user, result } of results) {
      if (result.ok) {
        users.push(user);
      }
    }

    created += batchSize;

    process.stdout.write(`\rCadastro: ${created}/${total}`);
  }

  console.log("");
  console.log(`Usuários criados: ${users.length}`);
  console.log("");

  return users;
}

async function testLogin(users, total) {
  console.log(`Testando ${total} requisições simultâneas de login...`);

  const result = await runConcurrentRequests(total, async (index) => {
    const user = users[index % users.length];

    return request(`${BASE_URL}/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });
  });

  printResult(result);

  console.log("");

  return result;
}

function extractToken(body) {
  return (
    body?.token ??
    body?.accessToken ??
    body?.data?.token ??
    body?.data?.accessToken
  );
}

async function testProfile(loginResult, total) {
  const tokens = loginResult.results
    .filter((result) => result.ok)
    .map((result) => extractToken(result.body))
    .filter(Boolean);

  console.log(`Tokens disponíveis: ${tokens.length}`);

  if (tokens.length === 0) {
    console.log("Nenhum token disponível para testar /me.");

    return;
  }

  console.log(`Testando ${total} requisições simultâneas de /me...`);

  const result = await runConcurrentRequests(total, async (index) => {
    const token = tokens[index % tokens.length];

    return request(`${BASE_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  });

  printResult(result);
}

async function main() {
  console.log("========================================");
  console.log("       LOAD TEST - NODE.JS MONOLITO");
  console.log("========================================");
  console.log(`Base URL:    ${BASE_URL}`);
  console.log(`Requisições: ${TOTAL_REQUESTS}`);
  console.log("========================================");
  console.log("");

  const users = await createUsers(TOTAL_REQUESTS);

  if (users.length === 0) {
    console.log("Nenhum usuário foi criado.");
    process.exit(1);
  }

  const loginResult = await testLogin(users, TOTAL_REQUESTS);

  await testProfile(loginResult, TOTAL_REQUESTS);

  console.log("");
  console.log("========================================");
  console.log("           TESTE FINALIZADO");
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
