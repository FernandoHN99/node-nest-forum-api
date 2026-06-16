# AGENTS.md

## Repo Facts
- Single NestJS API package; `pnpm-workspace.yaml` only controls allowed dependency build scripts, not app packages.
- Use pnpm (`pnpm-lock.yaml` lockfile) and Node `=22.20.0` from `package.json` even though `README.md` says Node 18+.
- Nest entrypoint is `src/infra/main.ts`; `nest-cli.json` sets `entryFile` to `infra/main`, and the app listens on `PORT` defaulting to `3333`.
- `@/*` maps to `src/*`; tests also import helpers with root-relative `test/...` paths.

## Commands
- Install dependencies: `pnpm install`.
- Start local Postgres and Redis: `docker-compose up -d` (`nest-clean-pg` on 5432, `nest-clean-cache` on 6379, data under ignored `data/`).
- Apply dev migrations: `pnpm prisma migrate dev`; schema changes must create migrations because e2e uses `pnpm prisma migrate deploy`.
- Start dev server: `pnpm start:dev`; build/compile check: `pnpm build`.
- Unit tests: `pnpm test`; focused unit test: `pnpm test -- src/path/file.spec.ts`.
- E2E tests: `pnpm test:e2e`; focused e2e test: `pnpm test:e2e -- src/path/file.e2e-spec.ts`.
- `pnpm lint` runs ESLint with `--fix` and will mutate files; `pnpm format` runs Prettier only on `src/**/*.ts` and `test/**/*.ts`.

## Environment And E2E
- Env is validated by Zod in `src/infra/env/env.ts`; add new variables there and in `.env.example`/`.env.test.example` when needed.
- JWT uses RS256; `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` are base64-decoded in `AuthModule`/`JwtStrategy`.
- E2E setup loads `.env` first, then `.env.test` overrides it; `.env.test.example` only sets `AWS_BUCKET_NAME` and `REDIS_DB`, so `.env` must still provide DB/JWT/R2 values.
- `test/setup-e2e.ts` creates a random Postgres schema, flushes the configured Redis DB, runs `pnpm prisma migrate deploy`, and drops the schema after the run.
- E2E setup disables domain events by default; event e2e specs re-enable `DomainEvents.shouldRun = true` before `app.init()` and usually assert async effects with `test/utils/wait-for.ts`.

## Architecture Notes
- Clean architecture boundaries: `src/core` primitives/events/errors, `src/domain/<context>/enterprise` entities/events, `src/domain/<context>/application` use cases and abstract ports, `src/infra` Nest/Prisma/Redis/R2/HTTP adapters.
- Use cases return `Either` (`left` for domain/application errors, `right` for success); controllers translate left cases to Nest HTTP exceptions and validate request bodies with `ZodValidationPipe`.
- New HTTP routes must register the controller and use case provider in `src/infra/http/http.module.ts`; routes are private by default because `JwtAuthGuard` is global, so public endpoints need `@Public()`.
- Persistence is wired in `src/infra/database/database.module.ts`: abstract repositories from `src/domain/**/application/repositories` bind to Prisma implementations and mappers under `src/infra/database/prisma`.
- Unit tests use in-memory repositories in `test/repositories` and factories in `test/factories`; update those alongside repository contract changes.
- File uploads use the real Cloudflare R2 adapter in `src/infra/storage/r2-storage.ts`; unit tests should use `test/storage/fake-uploader.ts` instead of real storage.
