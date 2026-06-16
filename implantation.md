# Implantacao no Render

Este passo a passo considera esta API NestJS com Prisma, PostgreSQL, Redis e Cloudflare R2.

## 1. Preparar o repositorio

1. Garanta que o projeto esteja em um repositorio Git remoto, como GitHub, GitLab ou Bitbucket.
2. Confirme que as migrations do Prisma estao versionadas em `prisma/migrations`.
3. Confirme que o lockfile `pnpm-lock.yaml` esta versionado.
4. Antes de publicar, valide localmente:

```bash
pnpm install
pnpm test
pnpm build
```

## 2. Criar o banco PostgreSQL no Render

1. No dashboard do Render, clique em **New +**.
2. Escolha **PostgreSQL**.
3. Defina um nome, por exemplo `forum-api-db`.
4. Escolha a regiao mais proxima do seu publico ou a mesma regiao do Web Service.
5. Crie o banco.
6. Depois de criado, copie a **Internal Database URL**.

Use a **Internal Database URL** na variavel `DATABASE_URL`, porque o Web Service vai rodar dentro da rede do Render.

## 3. Criar o Redis no Render

1. No dashboard do Render, clique em **New +**.
2. Escolha **Key Value** ou **Redis**, dependendo da interface atual do Render.
3. Defina um nome, por exemplo `forum-api-cache`.
4. Use a mesma regiao do Web Service.
5. Crie o servico.
6. Copie o host e a porta da conexao interna.

Esta aplicacao nao le `REDIS_URL`. Ela espera variaveis separadas:

```env
REDIS_HOST=host-interno-do-redis
REDIS_PORT=6379
REDIS_DB=0
```

Se o Render fornecer uma URL como `redis://red-xxxxx:6379`, use apenas `red-xxxxx` em `REDIS_HOST` e `6379` em `REDIS_PORT`.

## 4. Criar as chaves JWT

A API usa JWT com chaves RSA em base64. Gere as chaves localmente:

```bash
openssl genrsa -out private_key.pem 2048
openssl rsa -in private_key.pem -pubout -out public_key.pem
base64 -i private_key.pem
base64 -i public_key.pem
```

Copie a saida do `base64 -i private_key.pem` para `JWT_PRIVATE_KEY`.

Copie a saida do `base64 -i public_key.pem` para `JWT_PUBLIC_KEY`.

## 5. Configurar Cloudflare R2

Esta API usa R2 para upload de anexos. No painel da Cloudflare:

1. Crie ou escolha um bucket R2.
2. Copie o **Account ID** da conta Cloudflare.
3. Crie uma API Token/Access Key para R2 com permissao de escrita no bucket.
4. Separe estes valores:

```env
CLOUDFLARE_ACCOUNT_ID=seu-account-id
AWS_BUCKET_NAME=nome-do-bucket
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
```

## 6. Criar o Web Service no Render

1. No Render, clique em **New +**.
2. Escolha **Web Service**.
3. Conecte o repositorio deste projeto.
4. Configure:

```text
Runtime: Node
Branch: main ou a branch que sera implantada
Root Directory: deixe em branco, se este repositorio contem somente esta API
Build Command: corepack enable && pnpm install --frozen-lockfile && pnpm test && pnpm prisma generate && pnpm build
Start Command: pnpm prisma migrate deploy && pnpm start:prod
```

No plano free do Render, o **Pre-Deploy Command** pode nao estar disponivel. Por isso, as migrations rodam no **Start Command** antes da API iniciar.

O que cada parte faz:

- `corepack enable`: habilita o Corepack do Node para usar gerenciadores como `pnpm` no ambiente do Render.
- `pnpm install --frozen-lockfile`: instala as dependencias exatamente como estao no `pnpm-lock.yaml`; se o lockfile estiver desatualizado, o build falha.
- `pnpm test`: roda os testes unitarios; se algum teste falhar, o deploy para antes de publicar a aplicacao.
- `pnpm prisma generate`: gera o Prisma Client a partir de `prisma/schema.prisma`.
- `pnpm build`: compila a aplicacao NestJS para a pasta `dist`.
- `pnpm prisma migrate deploy`: aplica no banco de producao as migrations pendentes; se nao houver migration nova, nao altera nada.
- `pnpm start:prod`: inicia a API usando o codigo compilado em `dist/src/infra/main`, que e o entrypoint gerado pelo build deste projeto.

Nao coloque `pnpm prisma migrate deploy` no **Build Command**. O build deve compilar a aplicacao, e nao alterar o banco. Alem disso, dependendo da rede do Render, o ambiente de build pode nao conseguir acessar a URL interna do banco.

5. Em **Health Check Path**, use:

```text
/health
```

## 7. Configurar variaveis de ambiente

No Web Service do Render, va em **Environment** e cadastre:

```env
NODE_VERSION=22.20.0
DATABASE_URL=postgresql://...
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
CLOUDFLARE_ACCOUNT_ID=...
AWS_BUCKET_NAME=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
REDIS_HOST=...
REDIS_PORT=6379
REDIS_DB=0
GITHUB_REPOSITORY_URL=https://github.com/seu-usuario/seu-repositorio
```

Observacoes:

- Nao precisa definir `PORT`; o Render injeta essa variavel automaticamente.
- `GITHUB_REPOSITORY_URL` e opcional, mas pode ser usado pela pagina inicial da API.
- Nao coloque aspas ao redor dos valores no painel do Render.
- Se o valor base64 das chaves JWT tiver quebras de linha, copie em uma unica linha.

## 8. Fazer o deploy

1. Clique em **Create Web Service**.
2. Aguarde o build terminar.
3. O build vai instalar dependencias, rodar testes, gerar o Prisma Client e compilar a aplicacao.
4. Quando o servico iniciar, o comando `pnpm prisma migrate deploy` vai rodar antes da API subir.
5. Se o deploy falhar, abra os logs do Render e verifique principalmente:

```text
DATABASE_URL invalida ou inacessivel
JWT_PRIVATE_KEY/JWT_PUBLIC_KEY vazias ou mal formatadas
Redis inacessivel por REDIS_HOST/REDIS_PORT
Credenciais do Cloudflare R2 incorretas
```

## 9. Validar a aplicacao publicada

Depois que o Render mostrar o servico como ativo, teste:

```bash
curl https://sua-api.onrender.com/health
```

Tambem acesse a documentacao:

```text
https://sua-api.onrender.com/docs
https://sua-api.onrender.com/swagger
```

Para testar cadastro e login:

```bash
curl -X POST https://sua-api.onrender.com/accounts \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@example.com","password":"123456"}'
```

```bash
curl -X POST https://sua-api.onrender.com/sessions \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}'
```

## 10. Checklist final

- PostgreSQL criado e `DATABASE_URL` configurada com a URL interna.
- Redis criado e configurado com `REDIS_HOST`, `REDIS_PORT` e `REDIS_DB`.
- Chaves `JWT_PRIVATE_KEY` e `JWT_PUBLIC_KEY` em base64.
- Variaveis do Cloudflare R2 preenchidas.
- `NODE_VERSION=22.20.0` configurado.
- Build command configurado com `pnpm test`, `pnpm prisma generate` e `pnpm build`.
- Nenhum pre-deploy command configurado no plano free.
- Start command configurado com `pnpm prisma migrate deploy && pnpm start:prod`.
- Health check configurado em `/health`.
