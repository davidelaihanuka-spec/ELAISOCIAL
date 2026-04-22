# REEL

REEL is a Hebrew RTL client and video project management app. It is a hybrid app: the legacy single-page workflow still exists, and the newer `app/` layer adds Supabase auth, canonical data access, newer screens, and cloud sync.

## Current State

- Supabase auth, schema, storage upload, and RLS are in place.
- The workflow-fix and backend/data must-fix phases are complete.
- The Playwright regression suite is currently green at `23/23` as of `2026-04-10`.
- The app is close to production-ready, but still has hybrid legacy-state constraints.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Optional: create a local runtime config file from the example:

```bash
copy app-config.example.js app-config.local.js
```

3. Fill in your Supabase values in `app-config.local.js`:

```js
window.REEL_APP_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'your-public-anon-key',
  bucket: 'reel-files',
};
```

4. Start the preview server:

```bash
npm start
```

The app runs at [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Supabase Notes

- Runtime config is loaded from `app-config.local.js` before `app/config.js`.
- The app can still save Supabase config into browser `localStorage`, but local runtime config is the cleaner setup.
- The current schema lives in [supabase/schema.sql](/C:/Users/elai%20hanuka/Downloads/%D7%A7%D7%9C%D7%95%D7%93/%D7%90%D7%A4%D7%9C%D7%99%D7%A7%D7%A6%D7%99%D7%94%20%D7%A0%D7%99%D7%94%D7%95%D7%9C%20%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA/supabase/schema.sql).
- Before live production use, apply the latest schema to your real Supabase project, including the `public.tasks` table and its RLS policies.

## Available Scripts

- `npm run check`
  Runs the repo-owned JavaScript syntax verification pass across the app files.
- `npm start`
  Starts the local preview server.
- `npm run preview`
  Starts the same local preview server.
- `npm run test:e2e`
  Runs the Playwright end-to-end suite.

## Testing

Run the full end-to-end suite:

```bash
npm run test:e2e
```

Run the lightweight local verification pass:

```bash
npm run check
```

Key targeted specs used during recent stabilization:
- `tests/clients-tasks.spec.ts`
- `tests/pipeline-workspaces.spec.ts`
- `tests/calendar-scripts-tracking.spec.ts`
- `tests/finance-receipts.spec.ts`
- `tests/dashboard-onboarding.spec.ts`
- `tests/navigation-shell.spec.ts`
- `tests/settings-history-search.spec.ts`

## Remaining Hardening Work

- real-account Supabase verification after applying the latest schema
- reducing reliance on legacy globals and `localStorage`
- removing `eval`-based legacy bridge syncing
- adding fuller lint/typecheck/build tooling beyond the current syntax check

## Project Memory

The running project memory and detailed change log live in [CLAUDE.md](/C:/Users/elai%20hanuka/Downloads/%D7%A7%D7%9C%D7%95%D7%93/%D7%90%D7%A4%D7%9C%D7%99%D7%A7%D7%A6%D7%99%D7%94%20%D7%A0%D7%99%D7%94%D7%95%D7%9C%20%D7%9C%D7%A7%D7%95%D7%97%D7%95%D7%AA/CLAUDE.md).
