# Budget Buddy — personal expense tracker

A light, responsive MERN expense tracker with Google sign-in. Each signed-in
user manages their own income, expenses, custom categories, category budgets,
monthly history, and CSV exports.

## What it includes

- Google OAuth sign-in using Passport.js and server-side sessions
- User-scoped MongoDB data for categories, transactions, and budgets
- Income and expense transactions with custom categories
- Per-category monthly budgets, progress indicators, and over-budget alerts
- Dashboard cards and responsive history/category graphs
- Monthly expense-history CSV download
- Component-based React UI and separated Express routes, controllers,
  services, middleware, and models

## Project layout

```text
backend/src/
  config/          environment, MongoDB, session, Passport setup
  controllers/     request/response handling
  middleware/      authentication and error handling
  models/          User, Category, Transaction, Budget
  routes/          auth, dashboard, category, transaction, budget APIs
  services/        budget and dashboard calculations
  utils/           date, CSV, text, and async helpers

frontend/src/
  api/             authenticated API client
  app/             app bootstrap and state orchestration
  components/      reusable UI, layout, chart, budget, category, transaction UI
  hooks/           navigation and notices
  pages/           login, dashboard, transactions, budgets, categories
  utils/           formatting and CSV helpers
```

## Configure Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com/), create or use
   a project and configure the OAuth consent screen.
2. Create an **OAuth client ID** of type **Web application**.
3. Add the callback URL below under **Authorized redirect URIs**:

   ```text
   http://localhost/api/auth/google/callback
   ```

   For deployment, replace `localhost` with your public HTTPS domain and use
   that exact URL in both Google Cloud and `GOOGLE_CALLBACK_URL`.
4. Copy the example environment file and fill in the Google client credentials:

   ```bash
   cp .env.example .env
   ```

5. Set a long, unique `SESSION_SECRET`. On an HTTPS deployment, set
   `SESSION_COOKIE_SECURE=true`, and make `FRONTEND_URL`, `CORS_ORIGIN`, and
   `GOOGLE_CALLBACK_URL` use the public HTTPS origin.

Never commit `.env`, Google client secrets, or a production session secret.

## Run with Docker

```bash
docker compose up --build
```

Open [http://localhost](http://localhost). The browser talks to NGINX, which
proxies `/api` to Express; MongoDB remains private to the Docker network.

Useful commands:

```bash
docker compose logs -f backend
docker compose down
```

## API overview

All data endpoints require a signed-in session cookie.

| Area | Endpoints |
| --- | --- |
| Authentication | `GET /api/auth/me`, `GET /api/auth/google`, `GET /api/auth/google/callback`, `POST /api/auth/logout` |
| Dashboard | `GET /api/dashboard?month=YYYY-MM` |
| Categories | `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id` |
| Transactions | `GET/POST /api/transactions`, `PUT/DELETE /api/transactions/:id` |
| Export | `GET /api/transactions/export?month=YYYY-MM` |
| Budgets | `GET/POST /api/budgets?month=YYYY-MM`, `PUT/DELETE /api/budgets/:id` |

The dashboard aggregates the selected month and exposes income, expenses,
balance, category totals, recent transactions, budget status, and historical
trend data. Creating or editing an expense returns a budget warning when its
category has reached or exceeded that month’s limit.

## Data model

- **User** — Google identity and profile data.
- **Category** — belongs to one user, has an `income` or `expense` type.
- **Transaction** — belongs to one user and category; has type, amount, date,
  title, and optional note.
- **Budget** — belongs to one user and expense category, with a unique
  category/month budget limit.

New Google accounts receive a practical set of default income and expense
categories. Users can add, edit, and remove their own categories afterwards.

## Production notes

- Use HTTPS and set `SESSION_COOKIE_SECURE=true`.
- Restrict `CORS_ORIGIN` to the exact application origin; do not use `*` with
  cookie authentication.
- Use a managed MongoDB deployment and backups for real financial data.
- Set the Google OAuth callback to the exact public domain users visit.
