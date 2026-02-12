# Luxe Beauty

A full-stack beauty e-commerce application built with **NestJS** (backend API) and **Vue 3 + Vite** (frontend SPA), backed by PostgreSQL and S3-compatible object storage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | NestJS 11, TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Auth | Passport.js, JWT, Google OAuth 2.0 |
| Payments | Midtrans Snap |
| Object Storage | Garage S3-compatible |
| Frontend | Vue 3, Vite 7, TypeScript |
| State Management | Pinia |
| Routing | Vue Router 5 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Infrastructure | Docker Compose |

---

## Features

### Customer Storefront
- Browse products by category with search and pagination
- Product detail page with image gallery and variant selector (size, price)
- Shopping cart with quantity controls
- Checkout with shipping address form and Midtrans payment popup
- Order history and order detail pages
- Dynamic CMS pages (About, FAQ, Terms, etc.)
- Google OAuth and email/password authentication

### Admin Panel
- Dashboard with revenue, orders, and customer stats
- Product management (create, update, soft delete)
- Category management (hierarchical parent/child structure)
- Order management with status updates
- User management
- Banner management (homepage hero carousel)
- CMS page management (HTML content editor)
- Brand settings (key-value store)
- Image uploads to S3/Garage

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) and Docker Compose
- npm v10+

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd luxe-beauty
npm install
```

> `prisma generate` runs automatically via the `postinstall` script.

### 2. Start infrastructure (PostgreSQL + Garage S3)

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on port `5432`
- **Garage S3** on port `3900` (API), `3902` (admin)
- **Garage WebUI** on port `3909`

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your values. At minimum, set `JWT_SECRET` and `JWT_REFRESH_SECRET`. See [Environment Variables](#environment-variables) for the full list.

### 4. Run database migrations and seed

```bash
npm run db:migrate
npm run db:seed
```

This creates all tables and seeds:
- Admin user (`admin@luxebeauty.com` / `Admin@123`)
- Sample categories (Skincare, Makeup, and subcategories)
- Sample product (Hydra Glow Serum with variants)
- Homepage banner

### 5. Start the development servers

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Vue) | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| Swagger Docs | http://localhost:4000/api/docs |
| Garage WebUI | http://localhost:3909 |

---

## Default Admin Account

| Field | Value |
|---|---|
| Email | `admin@luxebeauty.com` |
| Password | `Admin@123` |
| Admin Panel | http://localhost:5173/admin |

---

## Development Commands

### Root (both workspaces)

```bash
npm run dev           # Start backend + frontend concurrently
npm run build         # Build both workspaces
npm run lint          # Lint both workspaces
npm run db:migrate    # Run Prisma migrations
npm run db:seed       # Seed the database
npm run db:studio     # Open Prisma Studio (DB GUI)
npm run db:generate   # Regenerate Prisma client after schema changes
```

### Backend only

```bash
npm run dev -w backend      # Start NestJS in watch mode
npm run build -w backend    # Compile TypeScript
npm run lint -w backend     # ESLint
```

### Frontend only

```bash
npm run dev -w frontend     # Start Vite dev server
npm run build -w frontend   # vue-tsc + vite build
npm run preview -w frontend # Preview production build
npm run lint -w frontend    # ESLint
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

# Optional — Google OAuth (leave blank to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Garage S3 (run: docker exec luxe-garage /garage key create luxe)
S3_ENDPOINT=http://localhost:3900
S3_REGION=garage
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=luxe-beauty
S3_PUBLIC_URL=http://localhost:3900/luxe-beauty

# Midtrans (leave blank to disable payments)
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

## Project Structure

```
/
├── backend/                  # NestJS API (port 4000)
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Registration, login, Google OAuth, JWT
│   │   │   ├── products/     # Product catalog + admin CRUD
│   │   │   ├── categories/   # Category tree + admin CRUD
│   │   │   ├── cart/         # Cart management
│   │   │   ├── orders/       # Order creation and history
│   │   │   ├── payments/     # Midtrans Snap + webhook
│   │   │   ├── upload/       # S3 image uploads
│   │   │   ├── admin/        # Dashboard stats + brand settings
│   │   │   ├── banners/      # Homepage banners
│   │   │   ├── cms/          # CMS pages
│   │   │   └── users/        # User profiles
│   │   ├── common/           # Guards, decorators, filters
│   │   ├── prisma/           # PrismaService (global)
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (13 models)
│   │   └── seed.ts           # Database seed script
│   └── package.json
├── frontend/                 # Vue 3 + Vite SPA (port 5173)
│   ├── src/
│   │   ├── pages/            # Route-level views
│   │   │   └── admin/        # Admin panel pages
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layouts/      # StorefrontLayout, AdminLayout
│   │   │   ├── ui/           # ProductCard, NotificationToast
│   │   │   └── admin/        # AdminNavItem, StatCard
│   │   ├── stores/           # Pinia stores (auth, cart, notification)
│   │   ├── api/              # Axios API layer
│   │   └── router/           # Vue Router config + navigation guards
│   └── package.json
├── docker-compose.yml        # PostgreSQL + Garage S3
├── garage.toml               # Garage S3 configuration
└── package.json              # Root workspace
```

---

## API Documentation

Interactive Swagger UI is available at **http://localhost:4000/api/docs** when the backend is running.

---

## Setting Up Garage S3 (Optional)

If you want image uploads to work locally:

```bash
# 1. Get the node ID
docker exec luxe-garage /garage node id

# 2. Apply layout (replace <node-id> with output from above)
docker exec luxe-garage /garage layout assign -z garage -c 1 <node-id>
docker exec luxe-garage /garage layout apply --version 1

# 3. Create bucket and access key
docker exec luxe-garage /garage bucket create luxe-beauty
docker exec luxe-garage /garage key create luxe
docker exec luxe-garage /garage bucket allow --read --write --owner luxe-beauty --key luxe

# 4. List key credentials and copy into backend/.env
docker exec luxe-garage /garage key list
docker exec luxe-garage /garage key info luxe
```
