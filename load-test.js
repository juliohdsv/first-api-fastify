import autocannon from "autocannon";
import fs from "node:fs";
import path from "node:path";

const caminhoArquivo = path.resolve(process.cwd(), "usuarios_10000.json");
const usuarios = JSON.parse(fs.readFileSync(caminhoArquivo, "utf-8"));

console.log("Iniciando o simulador de carga do Autocannon...");

// 2. Configura a instância do teste
const instancia = autocannon(
  {
    url: "http://localhost:3333", // ⚠️ Troque pela URL/porta real do seu Fastify
    connections: 100, // 100 conexões (usuários virtuais) batendo ao mesmo tempo
    amount: 10_000, // Vai parar o teste assim que atingir o valor amount requisições no total
    requests: [
      {
        method: "POST",
        path: "/sign-in",
        headers: { "content-type": "application/json" },
        // Função executada antes de enviar a requisição para escolher um usuário aleatório
        setupRequest: (request) => {
          const usuarioAleatorio =
            usuarios[Math.floor(Math.random() * usuarios.length)];
          request.body = JSON.stringify({
            email: usuarioAleatorio.email,
            password: "123456", // A senha que você criptografou no banco
          });
          return request;
        },
        // Executa assim que a API responde o login
        onResponse: (status, body, context) => {
          if (status === 200 || status === 201) {
            try {
              const resposta = JSON.parse(body);

              context.token = resposta.token;
            } catch (e) {
              // Falha ao ler o JSON de resposta
            }
          }
        },
      },
      {
        method: "GET",
        path: "/me",
        // Pega o token que foi salvo no contexto e injeta no cabeçalho Authorization
        setupRequest: (request, context) => {
          if (context.token) {
            request.headers["Authorization"] = `Bearer ${context.token}`;
          }
          return request;
        },
      },
    ],
  },
  (err, resultado) => {
    if (err) {
      console.error("Ocorreu um erro ao rodar o teste:", err);
      return;
    }

    // 3. Exibe os resultados organizados no terminal
    console.log("\n=============================================");
    console.log("       📊 RESULTADOS DO TESTE DE CARGA       ");
    console.log("=============================================");
    console.log(
      `🚀 Requisições por segundo (Média): ${resultado.requests.average}`,
    );
    console.log(
      `⏱️  Tempo de resposta médio (Média): ${resultado.latency.average} ms`,
    );
    console.log(`❌ Total de requisições com erro: ${resultado.errors}`);
    console.log(
      `📦 Total de dados trafegados: ${(resultado.throughput.total / 1024 / 1024).toFixed(2)} MB`,
    );
    console.log("=============================================\n");
  },
);

// Adiciona uma barra de progresso visual no terminal enquanto o teste roda
autocannon.track(instancia, { renderProgressBar: true });
