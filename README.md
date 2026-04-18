# VillageCircle360 — UK MVP

UK-first group savings and loan circle management platform. MVP is **software-only recordkeeping and workflow**; it does not hold customer funds, move money, issue e-money, or perform regulated lending.

## Repo structure

- **backend/** — NestJS + Prisma + PostgreSQL (modular monolith)
- **frontend/** — Next.js mobile-web (and future mobile app client)

## Requirements

- Node.js >= 18
- PostgreSQL (e.g. local or Docker)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env   # then set DATABASE_URL
npm install
npx prisma generate
npx prisma migrate dev   # applies migrations and creates DB
npm run start:dev
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/api/docs`

### 2. Frontend

**You must run `npm install` in `frontend/` before `npm run dev`.** Without dependencies, the dev server will not start and the browser will show `ERR_CONNECTION_REFUSED`.

```bash
cd frontend
npm install
npm run dev
```

Web app (default): **http://localhost:5784** — the API runs on **3000**, so do not use 3000 for the Next.js UI unless you changed the port.

If another port is in use, run: `npm run dev -- -p 3003` (or any free port) and open the URL shown in the terminal.

See **`frontend/README.md`** for troubleshooting connection refused errors.

### 3. From repo root

```bash
npm run backend:install
npm run frontend:install
# set backend/.env DATABASE_URL
npm run backend:prisma:generate
npm run backend:prisma:migrate
npm run backend:start:dev    # terminal 1
npm run frontend:dev        # terminal 2
```

## Tests

```bash
cd backend
npm run test
npm run test:cov
```

## Domain boundaries

| Module        | Responsibility                                      |
|---------------|-----------------------------------------------------|
| Group         | Circle/group CRUD, loan interest config, RBAC checks |
| Member        | Members per group, roles (ADMIN/MEMBER), leave       |
| Contribution  | Append-only contributions; idempotency; reversals   |
| Loan          | Loans, disbursement, repayments; idempotency; reversals |
| SocialFund    | Buckets and append-only entries; reversals          |
| Audit         | Immutable audit events for all critical mutations   |
| Evidence      | File reference registration (text + image)          |
| Notifications | SMS stub (integrate Twilio/similar for production)  |

## Principles

- **Records before money movement** — append-only financial events; no destructive edits.
- **Corrections** — reversals and adjustments only.
- **Audit** — every critical mutation emits an audit event.
- **RBAC** — enforced server-side on mutations and privileged reads (admin vs member).
- **Idempotency** — contribution and repayment posting accept `idempotencyKey`.
- **Evidence** — text reference or image upload for external transaction evidence.

## Migrations

- `prisma/migrations/20250301000000_init` — initial schema (groups, members, contributions, loans, social fund, audit, evidence).

## Environment

- **backend/.env**
  - `DATABASE_URL` — PostgreSQL connection string (required).
  - `PORT` — API port (default 3000).

## API contracts (summary)

- **POST /groups** — create group (body: name, groupType, currency?, loanInterestRate?; pilot: actorId in body).
- **GET /groups/:id** — get group.
- **PATCH /groups/:id** — update group (admin; body: actorMemberId, name?, loanInterestRate?, status?).
- **POST /members** — add member (body: groupId, displayName, phone?, role?, createdByMemberId?).
- **GET /members/:id**, **GET /members/group/:groupId** — get member, list by group.
- **PATCH /members/:id**, **PATCH /members/:id/leave** — update / leave (body: actorMemberId).
- **POST /contributions** — post contribution (idempotent; body: groupId, memberId, amount, idempotencyKey, evidenceType?, evidenceReference?, evidenceFileId?, actorMemberId).
- **POST /contributions/reversal** — reversal (admin; body: groupId, contributionId, actorMemberId, reason?).
- **GET /contributions/group/:groupId** — list (query: actorMemberId).
- **POST /loans** — create loan (admin); **POST /loans/:id/disburse** — disburse (admin).
- **POST /loans/repayments** — post repayment (idempotent); **POST /loans/repayments/reversal** — reversal (admin).
- **GET /loans/:id**, **GET /loans/group/:groupId** — get loan, list by group.
- **POST /social-fund/buckets** — create bucket (admin); **POST /social-fund/entries** — post entry; **POST /social-fund/entries/reversal** — reversal (admin).
- **GET /social-fund/buckets/group/:groupId**, **GET /social-fund/entries/bucket/:bucketId** — list (query: actorMemberId).
- **POST /evidence** — register evidence file; **GET /evidence/:id** — get metadata (query: actorMemberId).
- **GET /audit/group/:groupId** — list audit events (query: actorMemberId, limit?).
