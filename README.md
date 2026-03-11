# First API

Uma API RESTful construída com **Fastify** e **Prisma**, demonstrando um padrão de arquitetura em camadas para autenticação e gerenciamento de usuários.

## 📋 Índice

- [Visão Geral do Projeto](#visão-geral-do-projeto)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Começando](#começando)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Executando a API](#executando-a-api)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testando a API](#testando-a-api)

---

## Visão Geral do Projeto

Esta API implementa **autenticação completa** (Sign-Up, Sign-In e perfil) com uma arquitetura em camadas limpa e bem definida, utilizando as melhores práticas de desenvolvimento.

## Tecnologias

- **Fastify** (v5.8.2) - Framework web rápido e eficiente
- **Prisma** (v7.0.0) - ORM type-safe para gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional robusto
- **JWT (jsonwebtoken)** - Autenticação baseada em tokens
- **Bcrypt** - Hash seguro de senhas
- **Zod** - Validação de dados type-safe
- **Docker Compose** - Orquestração de containers
- **TypeScript** - Tipagem estática

---

## Arquitetura

A API segue um padrão de **arquitetura em camadas**, garantindo separação de responsabilidades e manutenibilidade. O framework Fastify é configurado no ponto de entrada (`src/index.ts`) que registra as rotas como plugins:

```mermaid
graph TB
    Client["🌐 Cliente HTTP<br/>(Postman, Browser, cURL, etc)"]

    subgraph "Ponto de Entrada"
        Entry["📍 index.ts<br/>Configuração do Fastify<br/>Registro de rotas como plugins<br/>Configuração de middlewares"]
    end

    subgraph "Rotas (Fastify Plugins)"
        SignUpRoute["📝 sign-up-route.ts<br/>POST /sign-up<br/>Registra o handler"]
        SignInRoute["🔐 sign-in-route.ts<br/>POST /sign-in<br/>Registra o handler"]
        ProfileRoute["👤 profile-route.ts<br/>GET /me<br/>Com middleware de autenticação"]
    end

    subgraph "Controllers (Handler)"
        SignUpCtrl["🎮 sign-up-controller.ts<br/>Valida payload com Zod<br/>Chama use-case"]
        SignInCtrl["🎮 sign-in-controller.ts<br/>Valida payload com Zod<br/>Chama use-case"]
        ProfileCtrl["🎮 profile-controller.ts<br/>Extrai userId do request<br/>Chama use-case"]
    end

    subgraph "Use Cases (Lógica de Negócio)"
        SignUpUC["⚙️ sign-up-usecase.ts<br/>Valida usuario<br/>Hash de senha<br/>Cria registro"]
        SignInUC["⚙️ sign-in-usecase.ts<br/>Verifica credenciais<br/>Gera JWT token"]
        ProfileUC["⚙️ profile-usecase.ts<br/>Busca dados do usuario"]
    end

    subgraph "Camada de Dados"
        Prisma["💾 Prisma Client<br/>Operações ORM<br/>Manipulação de dados"]
    end

    Database["🗄️ PostgreSQL<br/>Banco de Dados"]

    Middleware["🔒 Middlewares<br/>error-handler.ts<br/>isAuth.ts"]

    Client -->|HTTP| Entry
    Entry -->|Registra| SignUpRoute
    Entry -->|Registra| SignInRoute
    Entry -->|Registra| ProfileRoute

    SignUpRoute -->|Aponta para| SignUpCtrl
    SignInRoute -->|Aponta para| SignInCtrl
    ProfileRoute -->|Aponta para| ProfileCtrl

    ProfileRoute -->|Usa| Middleware

    SignUpCtrl -->|Chama| SignUpUC
    SignInCtrl -->|Chama| SignInUC
    ProfileCtrl -->|Chama| ProfileUC

    SignUpUC -->|Cria| Prisma
    SignInUC -->|Busca| Prisma
    ProfileUC -->|Busca| Prisma

    Prisma -->|SQL| Database
    Database -->|Resposta| Prisma

    Prisma -->|Dados| SignUpUC
    Prisma -->|Dados| SignInUC
    Prisma -->|Dados| ProfileUC

    SignUpUC -->|Resultado| SignUpCtrl
    SignInUC -->|Resultado| SignInCtrl
    ProfileUC -->|Resultado| ProfileCtrl

    SignUpCtrl -->|JSON| Client
    SignInCtrl -->|JSON| Client
    ProfileCtrl -->|JSON| Client
```

### Detalhamento das Camadas

#### 📍 **Ponto de Entrada** (`src/index.ts`)

Arquivo principal que:

- Cria a instância do Fastify
- Registra plugins (CORS, rotas como plugins)
- Configura middlewares (error handler)
- Inicia o servidor na porta 3333

**Conceito Fastify**: Rotas são registradas como **plugins**, não como middlewares tradicionais.

#### 📝 **Camada de Rotas** (`src/infra/routes/*`)

Arquivos individuais para cada rota (padrão modular):

- `sign-up-route.ts` - Registra POST `/sign-up`
- `sign-in-route.ts` - Registra POST `/sign-in`
- `profile-route.ts` - Registra GET `/me` com middleware de autenticação

Cada arquivo exporta uma função registrada como plugin Fastify.

#### 🎮 **Camada de Controlador** (`src/infra/controllers/*`)

Tratam requisição/resposta HTTP:

- Validam payloads com schemas Zod
- Extraem dados do `request` (body, headers, params)
- Chamam a lógica de negócio (use-cases)
- Retornam respostas com status HTTP apropriado
- Delegam tratamento de erros ao middleware global

#### ⚙️ **Camada de Lógica de Negócio** (`src/app/use-cases/*`)

Contém a lógica central:

- **sign-up-usecase.ts**: Valida se usuário existe, faz hash da senha, cria registro
- **sign-in-usecase.ts**: Verifica credenciais, gera JWT token
- **profile-usecase.ts**: Busca dados do perfil do usuário autenticado

#### 💾 **Camada de Dados** (`src/lib/prisma/`)

- Gerencia a instância do Prisma Client
- Todas as operações de banco são delegadas ao Prisma ORM
- Fornece métodos type-safe para queries

#### 🔒 **Middlewares** (`src/infra/middlewares/*`)

- **error-handler.ts**: Captura erros globalmente, trata Zod validation errors
- **isAuth.ts**: Valida JWT token, extrai userId do header Authorization

---

## Começando

### Pré-requisitos

Certifique-se de ter o seguinte instalado:

- **Node.js** (v18+)
- **npm** ou **yarn**
- **Docker** e **Docker Compose** (para executar o banco PostgreSQL)
- **PostgreSQL** (ou use Docker Compose)

### Instalação

1. **Clone ou navegue até o diretório do projeto:**

```bash
cd /Users/Henrique/Documents/www/yt/first-api-fastify
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` no diretório raiz com as variáveis necessárias:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/firstapi?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
```

4. **Inicie o banco de dados com Docker Compose:**

```bash
docker-compose up -d
```

5. **Execute as migrações do Prisma:**

```bash
npx prisma migrate dev
```

Isso irá:

- Criar o schema do banco de dados
- Aplicar todas as migrações
- Gerar o Cliente Prisma type-safe

### Executando a API

#### Modo de Desenvolvimento com hot-reload

```bash
npm run dev
```

O servidor iniciará com watch mode. Você verá:

```
Server running in dev mode.
```

A API estará disponível em: **`http://localhost:3333`**

**Hot-reload**: Qualquer mudança em arquivos TypeScript será automaticamente transpilada e o servidor reiniciará.

---

## Endpoints da API

### POST `/sign-up`

Cria uma nova conta de usuário.

**Requisição:**

```http
POST /sign-up HTTP/1.1
Host: localhost:3333
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Schema do Corpo da Requisição:**

| Campo      | Tipo   | Validação                             |
| ---------- | ------ | ------------------------------------- |
| `name`     | string | Obrigatório                           |
| `email`    | string | Obrigatório, deve ser um email válido |
| `password` | string | Obrigatório, mínimo 3 caracteres      |

**Resposta de Sucesso (201 Created):**

```json
{
  "message": "User created successfully"
}
```

**Respostas de Erro:**

**400 - Validação Falhou:**

```json
{
  "message": "Validation error",
  "issues": {
    "email": {
      "_errors": ["Invalid email"]
    }
  }
}
```

**409 - Usuário Já Existe:**

```json
{
  "message": "User already exist"
}
```

---

### POST `/sign-in`

Autentica um usuário e retorna um JWT token.

**Requisição:**

```http
POST /sign-in HTTP/1.1
Host: localhost:3333
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

**Schema do Corpo da Requisição:**

| Campo      | Tipo   | Validação                             |
| ---------- | ------ | ------------------------------------- |
| `email`    | string | Obrigatório, deve ser um email válido |
| `password` | string | Obrigatório, mínimo 3 caracteres      |

**Resposta de Sucesso (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZDM4YzVkNi1hZTQ0LTQzNDctYTkzNC04MjM0MDI3NTBmMDciLCJpYXQiOjE3MzY0MjE5ODR9.XaBcDeFgHiJkLmNoPqRsTuVwXyZ123..."
}
```

**Respostas de Erro:**

**400 - Validação Falhou:**

```json
{
  "message": "Validation error",
  "issues": {
    "password": {
      "_errors": ["password must be at least 3 characters long."]
    }
  }
}
```

**401 - Credenciais Inválidas:**

```json
{
  "message": "Unauthorized."
}
```

---

### GET `/me`

Obtém os dados do perfil do usuário autenticado. **Requer token JWT válido.**

**Requisição:**

```http
GET /me HTTP/1.1
Host: localhost:3333
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Headers Obrigatórios:**

| Header          | Tipo   | Descrição                             |
| --------------- | ------ | ------------------------------------- |
| `Authorization` | string | Bearer token JWT obtido no `/sign-in` |

**Resposta de Sucesso (200 OK):**

```json
{
  "id": "5d38c5d6-ae44-4347-a934-823402750f07",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "createdAt": "2026-03-11T12:15:30.000Z"
}
```

**Respostas de Erro:**

**401 - Token Inválido, Expirado ou Ausente:**

```json
{
  "message": "Unauthorized."
}
```

---

## Estrutura do Projeto

```
first-api-fastify/
├── src/
│   ├── index.ts                          # Ponto de entrada, configuração do Fastify
│   ├── app/
│   │   ├── errors/
│   │   │   ├── unauthorized-error.ts          # Erro 401 - Usuário não autorizado
│   │   │   └── user-already-exist-error.ts    # Erro 409 - Email já registrado
│   │   └── use-cases/
│   │       ├── sign-up-usecase.ts        # Lógica de criação de usuário
│   │       ├── sign-in-usecase.ts        # Lógica de autenticação e geração JWT
│   │       └── profile-usecase.ts        # Lógica de busca de perfil
│   ├── infra/
│   │   ├── controllers/
│   │   │   ├── sign-up-controller.ts     # Handler HTTP para /sign-up
│   │   │   ├── sign-in-controller.ts     # Handler HTTP para /sign-in
│   │   │   └── profile-controller.ts     # Handler HTTP para /me
│   │   ├── middlewares/
│   │   │   ├── error-handler.ts          # Tratamento global de erros
│   │   │   └── isAuth.ts                 # Validação de JWT token
│   │   └── routes/
│   │       ├── sign-up-route.ts          # Plugin Fastify - POST /sign-up
│   │       ├── sign-in-route.ts          # Plugin Fastify - POST /sign-in
│   │       └── profile-route.ts          # Plugin Fastify - GET /me
│   └── lib/
│       └── prisma/
│           ├── prisma.ts                 # Configuração do Prisma Client
│           └── generated/                # Gerado automaticamente pelo Prisma
│               └── prisma/               # Cliente Prisma type-safe
├── prisma/
│   ├── schema.prisma                     # Schema do banco de dados
│   └── migrations/                       # Histórico de migrações
├── .env                                  # Variáveis de ambiente (não commitado)
├── .env.example                          # Exemplo de variáveis de ambiente
├── docker-compose.yml                    # Configuração do Docker Compose
├── package.json                          # Dependências e scripts
├── tsconfig.json                         # Configuração do TypeScript
├── prisma.config.ts                      # Configuração do Prisma
├── README.md                             # Este arquivo
└── request.http                          # Testes HTTP com Rest Client
```

### Descrição dos Arquivos

#### Ponto de Entrada

- **src/index.ts**: Inicializa o Fastify, registra rotas como plugins, configura CORS e error handler

#### Camada de Aplicação (app/)

- **errors/**: Classes customizadas para diferentes tipos de erro
- **use-cases/**: Funções que contêm a lógica de negócio pura

#### Camada de Infraestrutura (infra/)

- **controllers/**: Handlers Fastify que tratam requisições HTTP
- **middlewares/**: Funções de middleware (error handler, autenticação)
- **routes/**: Plugins Fastify que registram endpoints

#### Banco de Dados

- **lib/prisma/**: Instância do Prisma Client
- **prisma/schema.prisma**: Definição do schema (Models, Relations)
- **prisma/migrations/**: Histórico de alterações do banco

---

## Testando a API

### Usando cURL

**Sign-Up:**

```bash
curl -X POST http://localhost:3333/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "password": "senha123"
  }'
```

**Sign-In:**

```bash
curl -X POST http://localhost:3333/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "senha123"
  }'
```

**Profile (substitua o token):**

```bash
curl -X GET http://localhost:3333/me \
  -H "Authorization: Bearer seu_token_aqui"
```

### Usando Postman

#### 1. Criar Sign-Up

1. Crie uma requisição **POST**
2. URL: `http://localhost:3333/sign-up`
3. Tab **Headers**: `Content-Type: application/json`
4. Tab **Body** → **raw** → **JSON**:

```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

5. Clique **Send**

#### 2. Fazer Sign-In

1. Crie uma requisição **POST**
2. URL: `http://localhost:3333/sign-in`
3. Tab **Headers**: `Content-Type: application/json`
4. Tab **Body** → **raw** → **JSON**:

```json
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

5. Clique **Send**
6. **Copie o token** da resposta

#### 3. Acessar Perfil

1. Crie uma requisição **GET**
2. URL: `http://localhost:3333/me`
3. Tab **Headers**:
   - `Authorization` = `Bearer seu_token_aqui` (cole o token obtido no Step 2)
4. Clique **Send**

### Usando Arquivo HTTP (REST Client)

O projeto inclui `request.http` para testes diretos no VS Code com a extensão [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client):

```http
### Sign-Up
POST http://localhost:3333/sign-up
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}

### Sign-In
POST http://localhost:3333/sign-in
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "password": "senha123"
}

### Get Profile (use o token do Sign-In)
GET http://localhost:3333/me
Authorization: Bearer seu_token_aqui
```

Clique em **"Send Request"** acima de cada bloco para executar.

---

## Fluxo de Autenticação

1. **Sign-Up**: Usuário se registra com email, nome e senha
   - Senha é hashada com bcrypt
   - Email deve ser único (409 Conflict se já existe)

2. **Sign-In**: Usuário faz login com email e senha
   - Sistema verifica credenciais
   - Retorna JWT token válido (configurável)

3. **Profile**: Usuário acessa dados do perfil
   - Requer JWT token válido no header `Authorization`
   - Token é validado pelo middleware `isAuth`
   - Retorna dados do usuário autenticado

---

## Tratamento de Erros

A API implementa tratamento de erros em diferentes camadas:

### Validação (Zod)

Erros de validação retornam **400 Bad Request**:

```json
{
  "message": "Validation error",
  "issues": {
    "email": {
      "_errors": ["Invalid email"]
    },
    "password": {
      "_errors": ["password must be at least 3 characters long."]
    }
  }
}
```

### Erros de Negócio

#### UserAlreadyExistError

- **HTTP Status**: 409 Conflict
- **Lançado em**: Sign-Up com email já registrado
- **Mensagem**: `"User already exist"`

#### UnauthorizedError

- **HTTP Status**: 401 Unauthorized
- **Lançado em**: Sign-In com credenciais inválidas ou Profile sem token válido
- **Mensagem**: `"Unauthorized."`

### Erros Internos

Qualquer erro não tratado retorna **500 Internal Server Error**:

```json
{
  "message": "Internal server error."
}
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/firstapi?schema=public"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura"

# Opcional: Porta (padrão 3333)
PORT=3333
```

### Variáveis Necessárias

- `DATABASE_URL`: Connection string do PostgreSQL
- `JWT_SECRET`: Chave secreta para assinar JWTs (mínimo 32 caracteres recomendado)

---

## Desenvolvimento

### Execute TypeScript em modo watch:

```bash
npm run dev
```

### Gere o Cliente Prisma após alterações no schema:

```bash
npx prisma generate
```

### Acesse o Prisma Studio para gerenciar dados:

```bash
npx prisma studio
```

---

## Stack Tecnológico Detalhado

| Tecnologia             | Versão  | Propósito                  |
| ---------------------- | ------- | -------------------------- |
| **Fastify**            | 5.8.2   | Framework web performático |
| **@fastify/cors**      | 11.2.0  | Middleware CORS            |
| **Prisma Client**      | ^7.0.0  | ORM type-safe              |
| **@prisma/adapter-pg** | ^7.0.0  | Adapter PostgreSQL         |
| **PostgreSQL**         | Latest  | Banco de dados             |
| **pg**                 | ^8.16.3 | Driver PostgreSQL          |
| **jsonwebtoken**       | ^9.0.3  | JWT token generation       |
| **bcrypt**             | ^6.0.0  | Password hashing           |
| **zod**                | ^4.1.12 | Schema validation          |
| **dotenv**             | ^17.2.3 | Environment variables      |
| **TypeScript**         | ^5.9.3  | Type safety                |
| **tsx**                | ^4.20.6 | TypeScript executor        |

---

## Contribuindo

Este é um projeto de aprendizado. Sinta-se livre para fazer fork, melhorar e abrir pull requests.

---

## Licença

ISC
