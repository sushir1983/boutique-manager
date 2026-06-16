# Boutique Manager (Vercel + Postgres)

Same boutique management app — customers, stitching/tailoring/customization orders, inventory (resale + rental), rentals, sales billing — adapted to run on Vercel.

## Why this version is different

Vercel's servers are serverless functions with no persistent disk, so the JSON-file storage from the local Node.js version won't survive a redeploy or cold start there. This version stores data in a Postgres database (Neon, via Vercel's built-in Postgres integration) instead. Everything else — the UI, the API shape, the conflict-safe save logic — is the same.

## Project layout

- `index.html` — the whole frontend (served as a static file by Vercel).
- `api/data.js` — `GET`/`PUT` for the whole dataset, with the same optimistic-concurrency versioning as the local version.
- `api/health.js` — health check.
- `api/backup.js` — downloads the current data as JSON.
- `api/_db.js` — shared database helper (creates the table on first use).

## Deployment (high level)

1. Get this code into a GitHub repository (Vercel deploys from Git).
2. Import the repo at vercel.com → New Project.
3. In the project's **Storage** tab, add a **Postgres** database (powered by Neon) and connect it to the project — Vercel wires up the connection string automatically as environment variables.
4. Deploy. Vercel installs `@vercel/postgres` and runs the `/api` functions automatically; `index.html` is served at the root.
5. Open the deployed URL — the app creates its table automatically on first request.

## Local development against the same database

```bash
npm install -g vercel   # one-time
vercel link             # connect this folder to your Vercel project
vercel env pull .env.local   # pulls the Postgres connection string locally
vercel dev              # runs the app locally, talking to the real cloud database
```

## Notes

- The whole dataset is stored as a single JSON blob in one Postgres row (mirrors the old JSON-file design) rather than being split into proper relational tables. That's intentionally simple and totally fine for a boutique's data volumes. If this ever needs real reporting/SQL queries across orders or rentals, that's the point to normalize it into separate tables.
- Conflict handling is unchanged: if two people save at the same moment, the second one gets refreshed with the latest data instead of silently overwriting it.
