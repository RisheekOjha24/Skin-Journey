# Skin Journey

An objective skincare progress platform, built for the YouCam API Skin AI & Apparel VTO Hackathon (Skin AI track).

Skin Journey turns the YouCam Skin Analysis API into a long-term skincare journal: every scan is stored permanently, charted over time, comparable before/after, and exportable as a dermatologist-ready PDF. Nothing in the app is estimated, predicted, or guessed — every score and every chart comes directly from a stored API measurement or the user's own journal notes.

---

## Monorepo layout

```
skin-journey/
├── backend/     Node.js + Express + TypeScript + SQLite API
└── frontend/    Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
```

Each folder is independently runnable and has its own `package.json` and `.env.example`.

---

## Prerequisites

- Node.js 20+ and npm
- A YouCam / Perfect Corp API key (optional to start — see **Mock Mode** below)
- A Google Gemini API key (optional — only needed for the AI progress summary feature)

---

## 1. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API starts on `http://localhost:4000` and automatically creates/migrates the SQLite database on first boot (no separate migration step required).

### Backend environment variables (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `4000`) |
| `DATABASE_PATH` | Path to the SQLite file (auto-created) |
| `JWT_SECRET` | Random string, 16+ characters — used to sign auth tokens |
| `JWT_EXPIRES_IN` | Session length, e.g. `7d` |
| `YOUCAM_API_BASE_URL` | Perfect Corp YouCam API base URL |
| `YOUCAM_API_KEY` | Your YouCam API key from the Developer Console |
| `YOUCAM_MOCK_MODE` | `true`/`false` — see below |
| `EXTERNAL_API_TIMEOUT_MS` | Timeout (ms) for all outbound Axios calls to third-party APIs, default `20000` |
| `GEMINI_API_KEY` | Google Gemini API key (for AI progress summaries) |
| `GEMINI_MODEL` | Gemini model name, default `gemini-1.5-flash` |
| `CORS_ORIGIN` | Frontend origin allowed to call the API |
| `UPLOAD_DIR` | Where uploaded scan photos are stored on disk |
| `MAX_UPLOAD_SIZE_MB` | Max photo upload size |

### Mock Mode (`YOUCAM_MOCK_MODE`)

The app ships with `YOUCAM_MOCK_MODE=true` by default. In this mode, `backend/src/services/youcam.service.ts` returns **deterministic** mock skin-metric scores derived from a hash of the uploaded photo (the same photo always produces the same mock scores), so you can fully demo the product — scans, dashboard, timeline, comparisons, journal, PDF report — before a live YouCam key is provisioned.

### Live mode — the real YouCam API contract

`youcam.service.ts` implements Perfect Corp's actual documented V2 flow (confirmed against `docs.perfectcorp.com/reference/ai_skin_analysis` and Perfect Corp's own integration guide):

1. **Auth**: a plain `Authorization: Bearer YOUR_API_KEY` header — V2 has no separate token-exchange call.
2. **Upload**: `POST /s2s/v2.0/file/skin-analysis` returns a pre-signed URL + `file_id`; the image bytes are then `PUT` directly to that URL.
3. **Analyze**: `POST /s2s/v2.0/task/skin-analysis` with `src_file_id` + `dst_actions` (e.g. `wrinkle`, `pore`, `texture`, `acne`, `moisture`, `radiance`, ...) starts an async task and returns a `task_id`.
4. **Poll**: `GET /s2s/v2.0/task/skin-analysis/<task_id>` until `task_status` is `"success"`, then read the `hd_*` result fields (each with a `ui_score` and `raw_score`).

To switch to live scoring:
1. Set `YOUCAM_API_KEY` in `.env` (base URL is already correct: `https://yce-api-01.makeupar.com`)
2. Set `YOUCAM_MOCK_MODE=false`
3. Open `backend/src/services/youcam.service.ts` — the file header there marks exactly which field names are **confirmed** from Perfect Corp's docs (acne, wrinkle, pore, texture, moisture, radiance, skin_age, overall score) versus **inferred by naming convention** (redness, oiliness, dark_circle, spot — Perfect Corp's materials name these concerns but didn't publish their literal JSON keys in the snippets available when this was written). Confirm those inferred field names against your account's API Console/Playground response; the mapping is isolated to `mapYouCamResultToMetrics()`, so a correction only touches one function. No other file in the codebase needs to change — every other feature only depends on the normalized `NormalizedSkinAnalysis` shape this service returns.
4. Uploaded photos should already fit Perfect Corp's size spec (long side ≤ 4096px, short side ≥ 1080px for HD scoring) — this service does not resize images before upload.

Perfect Corp also has a separate **AI Skin Simulation** API (`docs.perfectcorp.com/reference/ai_skin_simulation`) that projects a simulated "after" image for a given concern. It follows the same File → Task pattern but is intentionally **not** integrated here — Skin Journey's core premise is that every number shown is a real measurement, never a projection, so wiring in a simulated result would contradict the product. It's a reasonable candidate for a separate, clearly-labeled opt-in feature later.

### AI Summary (Gemini)

If `GEMINI_API_KEY` is not set, the "Generate AI Summary" feature on the Report page will return a clear error but the rest of the app works normally. The Gemini prompt (`backend/src/services/gemini.service.ts`) is explicitly instructed to only restate measured trends from stored data — never to predict, diagnose, or recommend products.

---

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The app starts on `http://localhost:3000`.

### Frontend environment variables (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | URL of the running backend, default `http://localhost:4000` |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | Timeout (ms) for the shared Axios client, default `15000` |

---

## Running both together

Open two terminals:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Then visit `http://localhost:3000`, register an account, and complete the baseline scan to reach the dashboard.

---

## Feature tour

- **Baseline + weekly scans** — guided photo capture with consistency tips, analyzed via the YouCam Skin Analysis API (or mock mode).
- **All Scans gallery** (`/scans`) — every scan in a grid, with checkbox multi-select for bulk deletion alongside a per-card hover delete action, both backed by a shared shadcn `AlertDialog` confirmation. Deletes are optimistic (removed from the UI immediately, rolled back with an error toast if the request fails) and also remove the underlying photo file from disk on the server.
- **Dashboard** — latest score, trend, next recommended scan date, recent activity, and the "Skin Progress Timeline" ribbon (scans plotted as measured nodes, milestones as flags on the same axis).
- **Timeline** — full historical chart for the overall score and every individual metric (acne, redness, pores, texture, etc.).
- **Before & After Comparison** — pick any two scans and see a metric-by-metric, direction-aware comparison (the app knows "texture" is healthier when higher and "redness" is healthier when lower, and labels every change "improved" or "regressed" accordingly — never a raw, ambiguous number).
- **Journal** — log products, AM/PM routines, sleep, water intake, and free-form notes alongside your scans.
- **Milestones** — mark routine changes, new products, dermatologist visits, etc., which appear as flags on the timeline.
- **Report** — generate an AI progress summary (Gemini, grounded only in your stored data) and download a complete dermatologist-ready PDF, with each scan's actual photo embedded in a fixed-size, aspect-ratio-preserved frame alongside its metrics.

---

## Architecture notes

### Backend
- **Layered structure**: `routes → controllers → services → repositories → SQLite`, with `middleware/`, `validations/` (Zod), `utils/`, and `config/` (env + constants) kept separate.
- **Zod everywhere**: environment variables (`config/env.ts`) and every request body/query/params are validated before reaching a controller.
- **Centralized error handling**: every thrown error is an `ApiError`; a single middleware turns it into a consistent `{ success, error }` JSON response.
- **No AI in the scoring path**: skin scores, metric direction (better/worse), overall score, and trend detection (`utils/skin-metrics.util.ts`) are all plain, transparent arithmetic — never model output. AI (Gemini) is only used for the optional plain-language progress summary, and even that is restricted to restating stored numbers.
- **Outbound HTTP layer (Axios)**: every call to a third-party API (YouCam, plus fetching a remote scan image for the PDF report) goes through `lib/http-client.ts`, a shared Axios client factory with dev-mode request/response logging and a consistent timeout (`EXTERNAL_API_TIMEOUT_MS`). `utils/http-error.util.ts` centralizes classifying failures (network error, timeout, 401/403, 429, 5xx, unexpected) into the same `ApiError` shape everything else in the app already uses — no service has its own try/catch classification logic. One deliberate exception: the raw upload PUT to YouCam's pre-signed URL bypasses the shared client's default auth header, since attaching our API key would invalidate that URL's signature (documented inline in `youcam.service.ts`).

### Frontend
- **Next.js App Router + TypeScript**, styled with **Tailwind + shadcn/ui** (Radix primitives) on a custom design system — a botanical-green/dusty-rose palette with Fraunces (display), Inter (body), and IBM Plex Mono (data) — intentionally not the generic "AI product" look.
- **Config-driven**: labels, routes, messages, and per-feature constants live in `frontend/config/*.config.ts` rather than being hardcoded inside components.
- **Typed API layer (Axios)**: a single Axios instance in `lib/http-client.ts` (base URL + timeout from `config/api.config.ts`, `NEXT_PUBLIC_API_TIMEOUT_MS` to tune it) attaches the auth header and logs requests/responses in development via interceptors. `lib/api-client.ts` wraps it with `apiRequest` / `apiRequestWithMeta` (JSON) and `apiDownload` (blob, e.g. the PDF report) — every one of them normalizes failures into the same `ApiClientError` (network / timeout / API error, with the server's error code and message preserved), so no feature service duplicates error handling. Each feature still has its own thin `services/*.service.ts` and `hooks/use-*.ts` on top.
- **Navigation**: `components/layout/app-sidebar.tsx` uses the official shadcn `Sidebar` primitives (`SidebarProvider`, `Sidebar collapsible="icon"`, `SidebarRail`, `SidebarTrigger`) rather than a hand-rolled implementation. It's fixed to the viewport with only the `SidebarInset` content area scrolling, collapses to icon-only on desktop, and automatically swaps to a `Sheet`-based off-canvas panel on mobile (via the same component's built-in `useIsMobile` check) — no separate hamburger-menu implementation to keep in sync.
- **Route transition feedback**: `components/common/route-progress.tsx` is a slim top-of-viewport progress bar (mounted once in the root layout) that starts on any internal link click and finishes when the destination route actually commits (detected via `usePathname`/`useSearchParams` changing). Clicking a second link before the first navigation lands simply restarts the same bar — there's structurally never more than one indicator, so "cancel the previous, show the new one" falls out for free rather than needing extra state.
- **Signature visual**: `components/dashboard/timeline-ribbon.tsx` — a hand-built SVG "lab timeline" showing scans as measured nodes and milestones as flags on one continuous axis, rather than treating scans and life context as separate charts.

---

## Known limitations / next steps

- `YOUCAM_MOCK_MODE` is on by default — plug in a real key and confirm the live request/response contract as described above before a production demo.
- Auth uses a JWT stored in `localStorage` on the client — fine for a hackathon/demo deployment; a production hardening pass would move to httpOnly cookies.
- No automated test suite is included given the hackathon timeline; `npm run typecheck` (both apps) and `npm run build` (frontend) are verified clean and are good pre-deploy checks.
- Next.js is pinned to the latest patched `14.2.x` release. A broader `npm audit` will still show advisories for a wide historical version range (mostly self-hosted middleware/edge features this app doesn't use); a future upgrade to Next 15/16 is a reasonable follow-up but was out of scope here.

---

Built for the YouCam API Hackathon — Skin AI track.
