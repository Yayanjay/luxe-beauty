# AGENTS.md — Luxe Beauty E-Commerce

Monorepo: **NestJS** (backend API) + **Vue 3 + Vite** (frontend SPA)
Infrastructure: PostgreSQL 16 + Garage S3 (via Docker Compose)

---

## Repository Structure

```
/
├── backend/              # NestJS API (port 4000)
│   ├── src/
│   │   ├── modules/      # Feature modules (auth, products, cart, etc.)
│   │   ├── common/       # Guards, decorators, filters, interceptors
│   │   ├── prisma/       # PrismaService
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── frontend/             # Vue 3 + Vite SPA (port 5173)
│   ├── src/
│   │   ├── pages/        # Route-level views (storefront + admin)
│   │   ├── components/   # Reusable UI components
│   │   ├── stores/       # Pinia stores
│   │   ├── composables/  # Vue composables
│   │   ├── router/       # vue-router config
│   │   ├── api/          # Axios API layer
│   │   └── main.ts
│   └── package.json
├── docker-compose.yml
├── garage.toml
└── package.json          # Root workspace
```

---

## Commands

### Root (run both servers)
```bash
npm run dev           # Start backend + frontend concurrently
npm run build         # Build both
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed the database
npm run db:studio     # Open Prisma Studio (GUI for DB)
npm run lint          # Lint both workspaces
```

### Backend only
```bash
npm run dev -w backend          # Start NestJS in watch mode
npm run build -w backend        # Compile TypeScript
npm run lint -w backend         # ESLint
npm run db:generate -w backend  # Regenerate Prisma client after schema changes
npm run db:migrate -w backend   # prisma migrate dev
npm run db:seed -w backend      # ts-node prisma/seed.ts
npm run db:studio -w backend    # prisma studio
```

### Frontend only
```bash
npm run dev -w frontend         # Start Vite dev server
npm run build -w frontend       # vue-tsc + vite build
npm run preview -w frontend     # Preview production build
npm run lint -w frontend        # ESLint
```

### Running a single test (backend)
```bash
# Run tests for a single file
npx jest --testPathPattern="auth.service" -w backend

# Run tests for a single describe/it block
npx jest --testPathPattern="auth.service" --testNamePattern="should login" -w backend

# Run all tests
npx jest -w backend
```

### Infrastructure
```bash
docker compose up -d              # Start PostgreSQL + Garage S3
docker compose down               # Stop all containers
docker exec luxe-garage /garage bucket list
docker exec luxe-garage /garage key list
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://luxe:luxe_secret@localhost:5432/luxe_beauty
JWT_SECRET=change_me_to_a_random_secret
JWT_REFRESH_SECRET=change_me_refresh
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
S3_ENDPOINT=http://localhost:3900
S3_REGION=garage
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=luxe-beauty
S3_PUBLIC_URL=http://localhost:3900/luxe-beauty
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_MIDTRANS_CLIENT_KEY=
```

---

## Code Style Guidelines

### General
- **TypeScript strict mode** is enabled in both workspaces. Never use `any`; use `unknown` and narrow types.
- All files use **2-space indentation**.
- **Single quotes** for strings in TypeScript/JavaScript. Double quotes in HTML templates.
- **Trailing commas** in multi-line structures.
- **Semicolons** required.
- Max line length: **120 characters**.

### Imports
- Use **absolute imports** in backend: `import { X } from 'src/...'`
- Use **path aliases** in frontend: `import X from '@/...'` (`@` maps to `src/`)
- Import order (enforced by ESLint):
  1. Node built-ins
  2. External packages
  3. Internal modules (absolute/aliased)
  4. Relative imports
  5. Type-only imports last: `import type { Foo } from '...'`

### Naming Conventions
| Context | Convention | Example |
|---|---|---|
| Files (backend) | `kebab-case` | `auth.service.ts`, `jwt.guard.ts` |
| Files (frontend) | `PascalCase` for components, `kebab-case` for others | `ProductCard.vue`, `use-cart.ts` |
| Classes | `PascalCase` | `AuthService`, `ProductDto` |
| Interfaces/Types | `PascalCase`, no `I` prefix | `CreateProductDto`, `JwtPayload` |
| Variables/functions | `camelCase` | `getUserById`, `isLoading` |
| Constants | `UPPER_SNAKE_CASE` | `JWT_SECRET`, `MAX_FILE_SIZE` |
| Enums | `PascalCase` with `UPPER_SNAKE` values | `enum Role { ADMIN, CUSTOMER }` |
| Database models | `PascalCase` (Prisma convention) | `User`, `ProductVariant` |
| API routes | `kebab-case` | `/admin/product-variants` |
| Vue components | `PascalCase` | `<ProductCard />`, `<AdminSidebar />` |
| Pinia stores | `useXxxStore` | `useAuthStore`, `useCartStore` |
| Vue composables | `useXxx` | `useProduct`, `usePagination` |

### Backend (NestJS) Patterns
- **One module per feature**. Each module has its own folder: `module.ts`, `controller.ts`, `service.ts`, `dto/`, `entities/`.
- **DTOs** live in `dto/` subdirectory; use `class-validator` decorators for validation.
- **Guards**: `JwtAuthGuard` for authenticated routes, `RolesGuard` + `@Roles()` for admin.
- **Responses**: Always return typed objects, never raw Prisma models to clients. Use `class-transformer` `@Exclude()` on sensitive fields (password).
- **Error handling**: Throw NestJS built-in exceptions (`NotFoundException`, `UnauthorizedException`, etc.). Never throw raw `Error` in controllers.
- **Services** contain all business logic; controllers are thin (only handle HTTP concerns).
- **PrismaService** is a global injectable — do not instantiate Prisma directly.
- **Async/await** always; never `.then()` chains.

### Frontend (Vue 3) Patterns
- Use **Composition API** (`<script setup>`) exclusively. Never use Options API.
- **Pinia stores** for all shared/persisted state. Local component state uses `ref`/`reactive`.
- **Axios instance** (`src/api/client.ts`) handles base URL, JWT injection, and 401 refresh logic. Never use `fetch` directly.
- **Vue Router** navigation guards handle auth redirects. Admin routes require `meta: { requiresAdmin: true }`.
- Component props must be fully typed using `defineProps<{...}>()`.
- Emit events must be typed using `defineEmits<{...}>()`.
- Use `<Suspense>` + async components for heavy pages.
- Tailwind CSS utility classes only — no custom CSS unless absolutely necessary.
- Template expressions should be simple; extract complex logic to `computed`.

### Error Handling
- Backend: Global exception filter logs errors server-side; returns consistent `{ statusCode, message, error }` shape.
- Frontend: API errors are caught in the axios interceptor and dispatched to a notification store. Components should not have raw `try/catch` around API calls unless they need custom behavior.

### Database (Prisma)
- All schema changes require a migration: `prisma migrate dev --name <description>`.
- Never edit migration files after they are committed.
- Seed data goes in `prisma/seed.ts`.
- Use `prisma.$transaction` for operations that must be atomic.
- Soft deletes via `deletedAt DateTime?` — filter with `where: { deletedAt: null }`.

### Git
- Branch naming: `feat/`, `fix/`, `chore/` prefixes (e.g., `feat/product-search`).
- Commit messages follow Conventional Commits: `feat(products): add variant pricing`, `fix(auth): refresh token rotation`.
- Never commit `.env` files or secrets.
