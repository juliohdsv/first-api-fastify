const BASE_URL = "http://localhost:3333";

const CONCURRENT_REQUESTS = 10000;

async function signUp() {
  const email = `load-${Date.now()}@gmail.com`;

  const response = await fetch(`${BASE_URL}/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Load Test",
      email,
      password: "123456",
      role: "USER",
    }),
  });

  if (!response.ok) {
    throw new Error(`Sign-up failed: ${response.status}`);
  }

  return {
    email,
    password: "123456",
  };
}

async function signIn(credentials) {
  const response = await fetch(`${BASE_URL}/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`Sign-in failed: ${response.status}`);
  }

  const data = await response.json();

  return data.token;
}

async function getProfile(token) {
  const start = performance.now();

  try {
    const response = await fetch(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const duration = performance.now() - start;

    return {
      status: response.status,
      duration,
    };
  } catch (error) {
    return {
      status: 0,
      duration: performance.now() - start,
      error,
    };
  }
}

async function run() {
  console.log("1. Cadastrando usuário...");

  const credentials = await signUp();

  console.log("2. Fazendo login...");

  const token = await signIn(credentials);

  console.log("3. Iniciando carga...");
  console.log(`Requests simultâneas: ${CONCURRENT_REQUESTS}\n`);

  const start = performance.now();

  const requests = Array.from({ length: CONCURRENT_REQUESTS }, () =>
    getProfile(token),
  );

  const results = await Promise.all(requests);

  const totalTime = performance.now() - start;

  const successful = results.filter((result) => result.status === 200);

  const failed = results.filter((result) => result.status !== 200);

  const durations = results
    .map((result) => result.duration)
    .sort((a, b) => a - b);

  const average =
    durations.reduce((sum, value) => sum + value, 0) / durations.length;

  const p95 = durations[Math.floor(durations.length * 0.95)];

  console.log("\n========== RESULTADO ==========");
  console.log(`Total:       ${results.length}`);
  console.log(`Sucesso:     ${successful.length}`);
  console.log(`Falhas:      ${failed.length}`);
  console.log(`Tempo total: ${totalTime.toFixed(2)} ms`);
  console.log(`Média:       ${average.toFixed(2)} ms`);
  console.log(`P95:         ${p95.toFixed(2)} ms`);
}

run().catch(console.error);
