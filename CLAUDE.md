# REEL - Client and Video Project Manager

REEL is a Hebrew RTL client/project management app for video work. The current codebase is an incremental refactor of an older single-page localStorage app into a Supabase-backed app with a new `app/` layer.

This document is the single source of truth for:
- project structure
- current architecture
- practical editing rules
- current feature set
- recent changes

Do not split core project instructions into other docs. Keep this file updated after every meaningful change.

## Project Rules

1. Never edit `אפליקציית ניהול.html`.
   It is the original backup file.

2. Always update this file after meaningful app changes.
   The team is using `CLAUDE.md` as the running project memory.

3. Preserve Hebrew RTL UX.
   UI labels, layout direction, and mobile behavior must continue to work in RTL.

4. Treat the app as an incremental refactor, not a rewrite.
   The old global app still exists and the newer `app/` layer extends, patches, and gradually replaces it.

5. Verify syntax after JS edits.
   Run `node --check` on every changed JS file.

## Current Status

The app is no longer "just localStorage".

It now has a cloud/app shell layer under `app/` that adds:
- Supabase setup and auth
- canonical repository/data access
- local-to-cloud bridge and migration
- new screens such as Dashboard, Inbox, Ledger, Receipts, Tasks, Insights, Settings, Onboarding
- Client 360 and Project Workspace
- a structured project create/edit flow
- demo mode and Playwright smoke testing

Important architectural reality:
- The legacy app still owns a lot of UI and data behavior.
- The `app/` layer patches and hydrates legacy globals.
- Some bugs happen when code reads `window.*` while legacy script-scoped variables hold the real state.

Supabase reality:
- The app does have a real Supabase backend with auth, storage, schema, and RLS.
- The migration is partial, not complete.
- Several important flows still depend on localStorage and legacy globals even after login.
- Production readiness should be judged as "Supabase-backed hybrid app", not "fully cloud-native app".

## Root Files

```text
index.html
style.css
core.js
pipeline.js
clients.js
calendar.js
scripts.js
tracking.js
preview-server.js
playwright.config.ts
package.json
CLAUDE.md
אפליקציית ניהול.html   # original backup, do not modify
```

## App Layer

```text
app/
  app.css
  boot.js
  bridge.js
  config.js
  enhancements.js
  components/
    auth-shell.js
    form-controls.js
    new-client-flow.js
    project-flow.js
  services/
    client-model.js
    dev-mode.js
    inbox-model.js
    ledger.js
    receipts.js
    repository.js
    supabase.js
    tasks.js
    workspace-model.js
  state/
    app-state.js
  views/
    calendar-agenda.js
    client-workspace.js
    dashboard.js
    inbox.js
    insights.js
    ledger.js
    onboarding.js
    project-workspace.js
    receipts.js
    search.js
    settings.js
    tasks.js
```

## Architecture Summary

### Legacy Layer

The original app still uses top-level shared globals from classic script tags:
- `projects`
- `clientData`
- `scriptsData`
- `trackingData`
- `trashData`
- `archiveData`
- `activityLog`

Because these scripts share the same global scope, duplicate top-level `let` or `const` declarations can silently break the app.

### New Layer

The `app/` layer adds:
- config management
- Supabase auth and data access
- canonical app state
- cloud/local migration
- enhanced navigation and shell
- newer screens and workflows

### Bridge Layer

`app/bridge.js` is critical.

It:
- reads old local data
- builds canonical cloud-shaped data
- hydrates canonical cloud state back into the legacy stores
- writes both `window.*` and legacy lexical stores when needed
- patches save methods to sync cloud state

When fixing data bugs, always ask:
- is the bug in canonical state?
- in localStorage?
- in legacy lexical globals?
- or in `window.*` mirrors?

## Script Load Order

This is the current script order from `index.html` and should stay correct unless there is a good reason to change it:

```html
<script src="core.js"></script>
<script src="pipeline.js"></script>
<script src="clients.js"></script>
<script src="calendar.js"></script>
<script src="scripts.js"></script>
<script src="tracking.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="app-config.local.js"></script>
<script src="app/config.js"></script>
<script src="app/services/supabase.js"></script>
<script src="app/services/repository.js"></script>
<script src="app/services/dev-mode.js"></script>
<script src="app/services/client-model.js"></script>
<script src="app/services/ledger.js"></script>
<script src="app/services/inbox-model.js"></script>
<script src="app/services/receipts.js"></script>
<script src="app/services/tasks.js"></script>
<script src="app/services/workspace-model.js"></script>
<script src="app/state/app-state.js"></script>
<script src="app/views/dashboard.js"></script>
<script src="app/views/inbox.js"></script>
<script src="app/views/onboarding.js"></script>
<script src="app/views/tasks.js"></script>
<script src="app/views/client-workspace.js"></script>
<script src="app/views/receipts.js"></script>
<script src="app/views/ledger.js"></script>
<script src="app/views/insights.js"></script>
<script src="app/views/project-workspace.js"></script>
<script src="app/views/settings.js"></script>
<script src="app/views/calendar-agenda.js"></script>
<script src="app/views/search.js"></script>
<script src="app/components/new-client-flow.js"></script>
<script src="app/components/form-controls.js"></script>
<script src="app/components/project-flow.js"></script>
<script src="app/components/auth-shell.js"></script>
<script src="app/bridge.js"></script>
<script src="app/enhancements.js"></script>
<script src="app/boot.js"></script>
```

## CSS Load Order

```html
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="app/app.css">
```

`app/app.css` intentionally loads after `style.css` so the newer shell and workflow styling can override the legacy look safely.

## Main Feature Set

### Legacy Core Screens

- Pipeline
- Clients
- Calendar
- Payments
- Tracking
- Scripts
- Trash
- History

### Newer App Screens

- Dashboard
- Inbox
- Tasks
- Receipts
- Ledger
- Insights
- Client 360
- Project Workspace
- Onboarding
- Settings

### Newer Workflow Layers

- Supabase setup/auth overlay
- New Client flow
- structured Project Flow
- dedicated shoot days
- global search expansion
- demo mode for safe testing

## Current Data Model

### Legacy Stores

Stored locally and/or mirrored into legacy globals:
- `projects`
- `clientData`
- `scriptsData`
- `trackingData`
- `trashData`
- `archiveData`
- `activityLog`
- `shootDaysData`
- `reel_tasks`
- `reel_supabase_config_v1`

### Canonical Cloud Entities

Managed via `app/services/repository.js`:
- `clients`
- `client_packages`
- `projects`
- `scripts`
- `shoot_days`
- `payment_entries`
- `tracking_entries`
- `activity_entries`
- `archive_items`
- `trash_items`

Not yet in canonical cloud storage:
- tasks/follow-ups
- Supabase connection config
- some UI preferences and onboarding flags

### Shared Services

- `client-model.js`
  Normalizes client identity and reduces client-name-as-identity issues.

- `ledger.js`
  Flattens and summarizes payment data from projects and packages.

- `workspace-model.js`
  Aggregates client/project data for Client 360 and Project Workspace.

- `inbox-model.js`
  Builds actionable operational items such as overdue, waiting, unpaid, and follow-ups.

- `receipts.js`
  Central receipt/attachment status helper.

- `tasks.js`
  Follow-up/task storage and helpers.

## Key Commands

```bash
npm run preview
npm run test:e2e
node --check app/boot.js
```

### Preview URL

```text
http://127.0.0.1:4173
```

## Demo and Testing

### Demo Mode

The app supports a hidden demo mode for testing flows without a real Supabase login:

```text
http://127.0.0.1:4173/?demo=1
http://127.0.0.1:4173/?demo=1&resetDemo=1
```

Demo mode seeds:
- clients
- projects
- package/payment examples
- receipts
- scripts
- tracking entries
- shoot days
- activity
- tasks

### Playwright

Playwright is installed locally and configured through:
- `playwright.config.ts`
- `tests/calendar-scripts-tracking.spec.ts`
- `tests/clients-tasks.spec.ts`
- `tests/dashboard-onboarding.spec.ts`
- `tests/finance-receipts.spec.ts`
- `tests/navigation-shell.spec.ts`
- `tests/pipeline-workspaces.spec.ts`
- `tests/settings-history-search.spec.ts`

Current E2E coverage includes:
- shell/navigation
- dashboard and onboarding
- pipeline filters/workspaces
- clients and tasks
- calendar/scripts/tracking
- payments/ledger/receipts
- settings/history/search

### Latest Audit Snapshot

As of 2026-04-09:
- `npx playwright test` ran successfully as a command, but the suite is not green.
- 10 tests passed.
- 12 tests failed.

Highest-signal failing areas:
- package editing from the client panel
- payment deep-link/open-detail flows
- task draft handoff from client/project workspace actions
- project persistence after edit/reload
- tracking deletion
- archive/trash restore and permanent-delete flows

## Editing Rules

### Do Not Modify

- `אפליקציית ניהול.html`

### Be Careful With

- top-level globals in legacy scripts
- duplicated variable declarations across old script files
- replacing DOM content that contains child nodes needed later
- patch-on-patch logic in the legacy layer
- reading `window.projects` when the real store may still live in lexical `projects`

### When Changing UI

- keep RTL working
- check desktop and mobile
- avoid raw browser chrome when the app already has custom controls
- maintain the Heebo-based typography and current shell style unless intentionally redesigning

### When Changing Data Flows

- consider both canonical cloud state and legacy state
- verify bridge hydration still works
- verify `syncAll()` still refreshes the affected views
- verify the change works in real mode and demo mode when possible
- if the flow touches Supabase, confirm whether the data is truly cloud-backed or only mirrored from localStorage

## Minimum Verification Checklist

After meaningful JS changes:

1. Run `node --check` on every changed JS file.
2. Open the preview and verify the affected flow.
3. If the change touches navigation, data sync, or a high-traffic flow, run or extend Playwright coverage.
4. Update this file.

## Known Architecture Caveats

1. The app is still hybrid.
   Some screens are modernized, but many flows still depend on the old modal/global structure.

2. Legacy lexical stores matter.
   Updating `window.projects` alone is not always enough.

3. `tracking.js` loads last in the old layer.
   It contains patches and late behavior that depend on earlier globals.

4. Navigation is layered.
   `core.js` owns the original `goView`, while `app/enhancements.js` wraps it for newer screens and back navigation.

5. Bulk actions and cloud sync need extra care.
   Any operation that changes many projects at once must update the real legacy store, not only a mirrored copy.

6. Cloud sync is safer than the first migration version, but still hybrid.
   `app/services/repository.js` now upserts batches and removes stale rows by id instead of wiping each owner table first, but the app still rebuilds canonical state from legacy stores before syncing.

7. Legacy store synchronization now uses explicit registered getters/setters.
   This removed the older `eval` bridge path, but the hybrid legacy-state model still requires careful synchronization.

8. Tasks are now cloud-wired, but migration still depends on the bridge.
   `app/services/tasks.js`, `app/bridge.js`, and `app/services/repository.js` now route tasks into Supabase, while the UI still reads and writes through the legacy local task store.

9. Backup/import now covers the newer working stores, but still depends on the hybrid layer.
   `core.js` now exports and reapplies tasks, tracking, archive, trash, activity, shoot days, and key UI preferences, but the restore path still writes through legacy stores before the app rebuilds canonical state.

## Production Readiness Notes

This app has a real backend, but it is not yet fully production-ready.

What is already solid:
- Supabase auth exists.
- Supabase schema and RLS exist.
- storage-backed receipt/project file upload exists.
- the full Playwright suite is green again (`23/23` on 2026-04-10).
- runtime config can now come from `app-config.local.js` instead of browser storage alone.
- local run commands now include `check`, `start`, and `preview`.

What still blocks full readiness:
- tasks are now persisted through the Supabase sync path, but live production verification still depends on applying the schema migration and checking with a real account
- backup/import/export now captures the main working stores, but restore still depends on the legacy bridge path rather than a purely canonical restore flow
- sync no longer wipes every owner table first, but it still depends on hybrid bridge reconstruction rather than a fully canonical live data model
- important app behavior still depends on legacy globals and localStorage
- the bridge no longer uses `eval`; legacy stores now sync through explicit registered getters/setters, but the hybrid legacy-state model still adds maintenance risk
- hosted mode now expects runtime-injected Supabase config and no longer exposes browser-side setup as the normal production path, but local preview still retains a narrow localStorage config fallback and the app still loads the Supabase client from CDN
- there is now a repo-owned syntax `check` script, but there is still no fuller lint/typecheck/build pipeline yet

## Recent Changelog

### 2026-04-10

- Removed the remaining `eval`-based legacy store syncing in `core.js`, `clients.js`, `scripts.js`, `tracking.js`, `app/bridge.js`, `app/enhancements.js`, and `app/services/dev-mode.js`:
  - added explicit legacy store registration APIs in `core.js`
  - registered `projects`, `trashData`, `activityLog`, `archiveData`, `clientData`, `scriptsData`, and `trackingData` as getter/setter-backed stores
  - switched bridge hydration, import/restore replacement, pipeline bulk actions, and demo-mode seeding over to those explicit store APIs
  - updated legacy save helpers to keep their `window.*` mirrors aligned when lexical stores change
- Verified the `eval` cleanup checkpoint with:
  - `node --check core.js`
  - `node --check clients.js`
  - `node --check scripts.js`
  - `node --check tracking.js`
  - `node --check app/bridge.js`
  - `node --check app/enhancements.js`
  - `node --check app/services/dev-mode.js`
  - `npx playwright test tests/clients-tasks.spec.ts` -> passing
  - `npx playwright test tests/calendar-scripts-tracking.spec.ts` -> passing
  - `npx playwright test tests/settings-history-search.spec.ts` -> passing
  - `npx playwright test tests/pipeline-workspaces.spec.ts` -> passing
  - `npx playwright test tests/navigation-shell.spec.ts` -> passing
- Added hosted-config hardening in `app/config.js`, `app/components/auth-shell.js`, `app/boot.js`, and `tests/navigation-shell.spec.ts`:
  - runtime config now takes precedence over browser-stored config instead of being overridden by it
  - hosted mode can be forced explicitly with `?hosted=1`, which disables browser-side Supabase setup and local config saving
  - non-hosted local preview still keeps the narrow in-app config fallback for development
  - the auth overlay now shows a hosted-config-missing state instead of exposing the setup form when runtime config is required
  - the login screen hides the "edit connection" action when browser-side config editing is not allowed
- Verified the hosted-config checkpoint with:
  - `node --check app/config.js`
  - `node --check app/components/auth-shell.js`
  - `node --check app/boot.js`
  - `npx playwright test tests/navigation-shell.spec.ts -g "requires hosting-provided config in hosted mode instead of exposing browser setup|boots in demo mode and supports desktop plus dock navigation"` -> passing
- Added lightweight tooling hardening in `package.json`, `scripts/check.js`, and `README.md`:
  - added `npm run check` as a repo-owned non-mutating syntax verification command
  - the checker walks the app JavaScript files and runs `node --check` on each one
  - deliberately did not add a broad lint step yet, because the current hybrid legacy codebase still needs a lower-risk verification baseline first
- Verified the tooling checkpoint with:
  - `node --check scripts/check.js`
  - `npm run check` -> passing
- Added `README.md` with:
  - local setup steps
  - `app-config.local.js` runtime config instructions
  - current Supabase migration note for the `tasks` table
  - available scripts and current E2E verification status
  - the remaining production-hardening checklist
- Tightened `CLAUDE.md` so the current status is explicit:
  - script-load documentation now includes `app-config.local.js`
  - production-readiness notes now record that the full Playwright suite is green again (`23/23`)
  - runtime config and `start` script support are now documented as completed hardening work
- the remaining "should fix soon" items are now explicitly called out as localStorage/CDN config hardening and missing build/lint/typecheck tooling
- This is the current post-must-fix phase:
  - workflow bug fixes are complete
  - backend/data must-fix work is complete
  - the next work is production hardening and real Supabase verification

### 2026-04-09

- Documented the current production-readiness audit in `CLAUDE.md`.
- Explicitly recorded that the app already has a Supabase backend, schema, auth, storage integration, and RLS.
- Clarified that the app is still a hybrid migration: partially cloud-backed and partially localStorage-backed.
- Updated the testing section to reflect the actual Playwright spec files in the repo.
- Recorded the latest known E2E status: 10 passing tests and 12 failing tests.
- Added a production-readiness section covering:
  - local-only tasks
  - whole-table sync replacement
  - incomplete backup/import coverage
  - remaining dependency on legacy globals
  - missing build/lint/typecheck tooling
- Fixed the first must-fix workflow bug in `clients.js`:
  - package save now resolves the client name safely even if the client panel was just closed
  - `openClientPanel()` now ignores invalid/empty names instead of crashing in the avatar-color helper
- Verified the fix with:
  - `node --check clients.js`
  - `npx playwright test tests/clients-tasks.spec.ts -g "creates a client, edits details, and configures a package"` -> passing
- Remaining caveat for this area:
  - package actions still depend on legacy client-panel state and DOM fallback, not a fully canonical client context
- Fixed the second must-fix workflow bug in `core.js`:
  - payment detail routing itself was mostly correct
  - the real failure was a render-time exception inside `openPayDetail()` caused by a payment-history callback shadowing the global `h()` HTML-escape helper
  - renaming the local history entry variable restored payment detail rendering for dashboard, receipts, ledger, and search routes
- Verified the fix with:
  - `node --check core.js`
  - `npx playwright test tests/dashboard-onboarding.spec.ts -g "routes from dashboard cards into project, shoot-day, and payment flows"` -> passing
  - `npx playwright test tests/finance-receipts.spec.ts` -> passing
  - `npx playwright test tests/settings-history-search.spec.ts -g "renders insights and routes search results across entity types"` -> passing
- Remaining caveat for this area:
  - payment detail rendering is still generated from large inline template strings in `core.js`, so helper-name collisions remain an area to watch during future edits
- Fixed the third must-fix workflow bug in `app/services/tasks.js`:
  - task drafts from Client 360 and Project Workspace were being consumed too early because `openComposer()` both navigated to `Tasks` and forced an extra `tasksView.render()`
  - removing the redundant render lets the first tasks-screen render apply the pending draft once, so the title/client/project fields stay prefilled after the workspace jump
- Verified the fix with:
  - `node --check app/services/tasks.js`
  - `npx playwright test tests/clients-tasks.spec.ts -g "opens client workspace actions and preserves task drafts from workspace entry points"` -> passing
  - `npx playwright test tests/pipeline-workspaces.spec.ts -g "routes project workspace actions into edit, payments, tracking, tasks, and client flows"` -> passing
- Remaining caveat for this area:
  - browser-based manual preview verification was attempted, but Playwright MCP could not initialize in this Codex session because creating `C:\Windows\System32\.playwright-mcp` returned `EPERM`
- Fixed the fourth must-fix workflow bug in `app/components/project-flow.js` and `app/app.css`:
  - project creation/editing in the refactored project modal was reading `global.selStage`, but the real selected stage still lives in the legacy modal DOM state
  - the wrapper now derives the selected stage from the active `.stage-opt`, so validation, summaries, unsaved-change detection, and save behavior all use the actual stage value
  - the stage selector was also moved into a persistent shell above the step sections so it remains available while editing finance details, which keeps stage changes working before save and across reload verification flows
- Verified the fix with:
  - `node --check app/components/project-flow.js`
  - `npx playwright test tests/pipeline-workspaces.spec.ts -g "creates and edits a project with persistence across a non-reset reload"` -> passing
- Remaining caveat for this area:
  - `node --check` does not apply to CSS files, so `app/app.css` was verified through the passing end-to-end flow rather than a syntax check
- Fixed the fifth must-fix workflow bug in `tracking.js`:
  - tracking deletion was replacing the legacy lexical `trackingData` array without updating `window.trackingData`, so Playwright and newer app-layer readers could still see deleted entries
  - tracking persistence now always refreshes the global mirror before writing localStorage
  - save/delete flows now refresh the tracking view plus project/client workspace summaries so performance numbers stay in sync after edits
- Verified the fix with:
  - `node --check tracking.js`
  - `npx playwright test tests/calendar-scripts-tracking.spec.ts -g "adds, edits, and deletes tracking while updating project workspace summaries"` -> passing
- Remaining caveat for this area:
  - tracking still lives in the legacy local store and bridge sync path, so future refactors should keep lexical/global store replacement behavior in mind
- Fixed the sixth must-fix workflow bug in `core.js` and `clients.js`:
  - archive permanent-delete and restore paths were replacing the legacy `archiveData` array without reliably updating `window.archiveData`, so newer app-layer readers and Playwright still saw deleted archive entries
  - trash/archive save helpers now refresh their global mirrors before writing localStorage, and restore/delete actions now trigger a broader UI sync for consistency
  - the client-panel delete button was still using the older `clients.js` permanent-delete implementation instead of the intended trash flow, so client deletion now moves the client and its related projects into Trash and can be restored or permanently deleted from there
- Verified the fix with:
  - `node --check core.js`
  - `node --check clients.js`
  - `npx playwright test tests/settings-history-search.spec.ts -g "archives, restores, permanently deletes from archive, and renders history tabs"` -> passing
  - `npx playwright test tests/clients-tasks.spec.ts -g "moves a client to trash and restores it from the trash view|permanently deletes a trashed client item"` -> passing
- Remaining caveat for this area:
  - trash and archive behavior is now consistent for the tested flows, but both features still sit on top of legacy arrays rather than a canonical server-backed recycle-bin model
- Fixed the first backend/data must-fix in `app/services/tasks.js`, `app/services/repository.js`, `app/bridge.js`, `app/state/app-state.js`, and `supabase/schema.sql`:
  - tasks are now part of the canonical app state, legacy-to-canonical bridge mapping, and Supabase repository sync path
  - added a dedicated `public.tasks` table with RLS so task data has a real backend target instead of existing only in `localStorage`
  - task writes now go through `saveTasksStore()`, which gives the bridge the same sync hook it already uses for the other legacy stores
  - fixed an integration gap where `repository.fetchAll()` loaded remote tasks but did not return them into canonical state
- Verified the fix with:
  - `node --check app/services/tasks.js`
  - `node --check app/services/repository.js`
  - `node --check app/bridge.js`
  - `node --check app/state/app-state.js`
  - `npx playwright test tests/clients-tasks.spec.ts -g "opens client workspace actions and preserves task drafts from workspace entry points"` -> passing
  - `npx playwright test tests/clients-tasks.spec.ts -g "validates, creates, completes, reopens, deletes, and routes from tasks"` -> passing
- Remaining caveat for this area:
  - the data path is now wired for Supabase-backed tasks, but live authenticated cloud verification was not fully exercised in this Codex session, so the schema migration still needs to be applied in the actual Supabase project before real account sync can be confirmed end to end
- Fixed the second backend/data must-fix in `app/services/repository.js`:
  - `replaceAll()` no longer deletes every table for the current owner before re-inserting rows
  - sync now snapshots remote ids, batch-upserts current rows first, and only then deletes stale rows by id in reverse dependency order
  - this removes the "account temporarily empty during sync" failure mode and makes interrupted syncs materially safer
- Verified the fix with:
  - `node --check app/services/repository.js`
  - `npx playwright test tests/clients-tasks.spec.ts -g "creates a client, edits details, and configures a package"` -> passing
  - `npx playwright test tests/clients-tasks.spec.ts -g "validates, creates, completes, reopens, deletes, and routes from tasks"` -> passing
- Remaining caveat for this area:
  - sync is now incremental at the table level, but it still pushes a full rebuilt snapshot from hybrid legacy state instead of reconciling per-entity changes directly against canonical in-memory state
- Fixed the third backend/data must-fix in `core.js`, `tests/settings-history-search.spec.ts`, and `tests/fixtures/import-sample.json`:
  - backup export now includes tasks, tracking, archive, trash, activity log, shoot days, and key UI preferences instead of only the older project/client/script subset
  - import now reapplies the same broader snapshot through the shared hybrid-store path, while still accepting older backup shapes by falling back to empty arrays for missing newer sections
  - added a settings regression that round-trips the full backup snapshot in demo mode and verifies the newer stores persist back into localStorage
- Verified the fix with:
  - `node --check core.js`
  - `npx playwright test tests/settings-history-search.spec.ts -g "exports data, opens import confirmation, reconnects, and signs out from settings|captures and reapplies a full backup snapshot including newer stores"` -> passing
- Remaining caveat for this area:
  - backup coverage is now much closer to full working state, but restore still writes through legacy/localStorage stores first and then relies on the hybrid app to rebuild canonical state on top of that
- Added a production-config hardening pass in `index.html`, `preview-server.js`, `package.json`, `.gitignore`, and `app-config.example.js`:
  - the app shell now supports an optional root `app-config.local.js` file before `app/config.js`, so runtime Supabase config can come from a local script instead of browser storage alone
  - `preview-server.js` now serves a safe empty stub for `/app-config.local.js` when no local file exists, so the app boots cleanly in demo/dev/test mode without 404 noise
  - added `app-config.example.js` as the documented runtime config shape and ignored the real `app-config.local.js` file
  - added a `start` script alongside `preview` for a more standard local run command
- Verified the fix with:
  - `node --check preview-server.js`
  - `npx playwright test tests/navigation-shell.spec.ts -g "boots in demo mode and supports desktop plus dock navigation"` -> passing
- Remaining caveat for this area:
  - runtime config is now cleaner, but the app still allows saving Supabase config into browser localStorage and still loads the Supabase client from CDN rather than a bundled dependency

### 2026-04-07

- `CLAUDE.md` fully normalized into one language/style.
- Mixed formatting and old noisy sections were replaced with a clean, current project document.
- File lists, script order, and app-layer structure were re-checked against the live codebase.

### 2026-04-06

- Added in-app back navigation with history-aware desktop/mobile back buttons.
- Fixed bulk delete in Pipeline so selected projects really move to Trash.
- Added hidden demo mode and Playwright smoke tests.
- Fixed cloud/legacy hydration mismatch so old and new screens read the same real account state.
- Stopped sample seed data from appearing in real empty accounts.
- Added/expanded:
  - Project Flow
  - Receipts
  - Onboarding
  - Tasks
  - Inbox
  - Ledger
  - Insights
  - Settings
  - Client 360
  - Project Workspace

## Historical Lessons

Keep these in mind during future edits:

1. Duplicate top-level `let`/`const` declarations can silently kill a whole script.

2. Runtime bugs can hide even when static code review looks fine.
   Always reproduce the actual user flow.

3. `textContent` on a parent can destroy child nodes that later code expects.

4. Floating/mobile elements must maintain spacing above the dock.

5. Documentation only helps if it stays in the auto-loaded file.
   Keep project memory here.
