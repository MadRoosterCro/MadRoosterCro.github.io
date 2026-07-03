# PROJECT_MANIFEST.md

Source of truth for project facts. Other skills must read this file before
code or test changes.

On conflict: this file wins on project facts; `CLAUDE.md` wins on process.

## 1. Project Overview

- **Purpose:** Personal CV / portfolio site for Dario Car. Presents a profile
  card, intro, a data-driven work-experience list, and contact links.
- **Primary users:** Recruiters, hiring managers, and professional contacts
  visiting the public site.
- **Load-bearing constraint:** Served as static files by GitHub Pages at the
  custom domain `www.kotei.hr` (`CNAME`). No server-side runtime; everything
  must work as plain static assets fetched by the browser.

## 2. Platform & Tooling

- **Language:** HTML5, CSS3, and vanilla ES (browser JavaScript, ES2020+:
  `fetch`, optional chaining, `Array.prototype.at`, `Intl.DateTimeFormat`).
- **Runtime / target:** Modern evergreen browsers. No transpilation or bundling.
- **Frameworks:** None for the live page (`index.html` / `app.js` are
  framework-free). Legacy template assets bundle jQuery, Bootstrap, and jQuery
  plugins but are not referenced by the current page (see sections 4–5).
- **Package manager:** `npm` with `package-lock.json`. Used only for dev
  tooling (formatting); no runtime dependencies are bundled into the page.
- **Build / run:** No build step for the live page. Serve statically, e.g.
  `python3 -m http.server` from the repo root, then open `index.html`.
  Production is served by GitHub Pages directly from `main`. `node_modules/` is
  git-ignored; run `npm install` to restore dev tooling.
- **Typecheck:** None.
- **Lint:** None.
- **Formatter:** Prettier (`prettier` devDependency). Config in `.prettierrc`
  (`printWidth 80`, `tabWidth 2`, `semi true`, `singleQuote false`), scope in
  `.prettierignore`. Commands: `npm run format` (write), `npm run format:check`
  (verify). Run during final review, not mid-change.
- **Test runner:** None.

Gaps (as found, not auto-added): no test runner or linter is configured.
Adding either requires user approval and a manifest update.

## 3. Architecture

- **Pattern:** Single static HTML page with progressive enhancement. `app.js`
  fetches `data/positions.json` and renders the experience list into the DOM.
- **Layers:**
  - `index.html` — page structure and static content.
  - `app.css` — presentation (CSS custom properties, `color-scheme: light dark`).
  - `app.js` — data fetch, formatting, grouping, and pagination logic.
  - `data/positions.json` — content data (work positions).
- **Dependency direction:** `app.js` depends on the DOM ids/classes in
  `index.html` and the shape of `data/positions.json`. No reverse dependency.
- **Concurrency/async:** Single async `load()` on `DOMContentLoaded`; one
  `fetch` for positions with try/catch fallback UI.
- **Deployment:** Push to `main` on GitHub triggers GitHub Pages publish.
  `_config.yml` sets a Jekyll theme, but the live page is hand-authored static
  HTML rather than Jekyll-templated content.

## 4. Project Structure

- **Topology:** Single package, single repo.
- **Workspace tool:** None.
- **Manifest / docs location:** `PROJECT_MANIFEST.md` and `documentation/` at
  repo root.
- **Top-level folders:**
  - `data/` — `positions.json` content.
  - `files/` — downloadable `Dario-Car-Resume.pdf`.
  - `images/` — page imagery (`dario.png` is the live avatar; the remaining
    `about/alone/cover_bg_1/sraka/loc` files are unused legacy imagery).
- **Live entry points:** `index.html`, `app.css`, `app.js`.
- **Config:** `_config.yml` (`theme: jekyll-theme-midnight`) for GitHub
  Pages/Jekyll; inert for the front-matter-free `index.html`. `package.json`,
  `.prettierrc`, `.prettierignore` for the formatter. `.gitignore` excludes
  `node_modules/` and `.DS_Store`.
- **Removed:** legacy `css/`, `js/`, `sass/`, `fonts/`, and `prepros-6.config`
  (see `documentation/changes/remove-legacy-template-assets.md`).

## 5. Key Modules & Components

- `index.html` — Page shell: topbar nav, hero (profile card + intro + CTAs),
  `#resume` section with `#positions` container and `#loadMore` control, footer
  with `#year`. Contract: exposes ids `positions`, `loadMore`, `year` consumed
  by `app.js`.
- `app.js` — IIFE, `"use strict"`. Fetches `POSITIONS_URL`
  (`./data/positions.json`), paginates by `PAGE_SIZE = 5`, groups
  *consecutive* roles sharing company + location, renders an ordered company
  list with per-role highlights, and wires the "Show more" control. Sets the
  footer year. Fails to a "Positions unavailable" message on fetch error.
- `data/positions.json` — Array of position objects: `title`, `company`,
  `location`, `start` (`YYYY-MM`), `end` (`YYYY-MM` or `Present`),
  `highlights` (string array). 11 entries as of adoption. Order is newest-first
  and drives display order and grouping.
- `app.css` — Design tokens via `:root` custom properties; light/dark aware.

## 6. State & Data Flow

- **Content source:** `data/positions.json`, fetched at runtime with
  `cache: "no-cache"`.
- **Lifecycle:** `load()` runs on `DOMContentLoaded` (or immediately if the DOM
  is ready) → fetch JSON → `renderPositions()` with a `visibleCount` →
  "Show more" increments `visibleCount` by `PAGE_SIZE` and re-renders.
- **State:** In-memory only (`visibleCount`); no persistence, storage, cookies,
  or navigation state.
- **Error propagation:** Fetch/parse failures are caught; the UI shows a
  fallback message, the "Show more" control is hidden, and the error is logged
  via `console.warn`.

## 7. Dependencies

- **Core toolchain:** `npm` (dev only) hosting the formatter.
- **Runtime dependencies (live page):** None. `app.js` uses only browser APIs.
- **Dev dependencies:** `prettier` (formatter). Not shipped to the page.
- **Removed:** the vendored legacy template stack (jQuery, Bootstrap,
  FlexSlider, Owl Carousel, Waypoints, countTo, Modernizr, Respond.js, icomoon)
  was deleted in `documentation/changes/remove-legacy-template-assets.md`.
- **Policy:** Any new dependency requires explicit user approval and a manifest
  update. Do not reintroduce the removed template stack into the live page
  without approval.

## 8. Testing

- **Framework:** None.
- **Layout / naming / suite command:** None.
- **Boundary:** No automated tests exist. New logic in `app.js` is not
  currently unit-testable without introducing a test setup; record that
  decision in the active feature artifact if tests are requested.
- Integration/e2e: manual — serve statically and verify rendering,
  pagination, and the resume download in a browser.

## 9. Conventions

- **Naming:** camelCase CSS class names and DOM ids in the live page (e.g.
  `heroInner`, `companyList`, `loadMore`). Data keys are lowercase.
- **Formatting:** Enforced by Prettier (`.prettierrc`): 2-space indentation,
  double-quoted strings, semicolons, 80-col print width. Run `npm run format`.
- **File organization:** Live page kept as three root files (`index.html`,
  `app.css`, `app.js`) plus `data/`. Do not reintroduce the removed template
  stack into the live page without approval.
- **Error handling:** Guard DOM lookups and data shapes defensively; degrade to
  a visible fallback rather than throwing.
- **Logging:** `console.warn` for non-fatal runtime issues only.
- **Localization:** English only. Dates rendered via `Intl.DateTimeFormat`.

Cross-project rules (always apply):

- English only in committed artifacts.
- Prefer direct control flow and clear names.
- Keep functions/modules small and single-purpose.
- Use standard language/toolchain features before custom machinery.
- Introduce an abstraction only after repeated real need or an approved
  testability seam.
- Avoid speculative options, unused extension points, and clever one-liners.
- Comments explain why: constraints, trade-offs, invariants, side effects,
  temporary workarounds.
- Do not write comments that restate names, types, or steps visible in the
  code.
- Doc comments belong on public/exported APIs only when they add contract,
  units, ranges, side effects, failure modes, examples, or migration notes.
- TODO format: `TODO(scope): action` with ticket when one exists.

## 10. Technical Decisions & Constraints

- **Static-only hosting (GitHub Pages, `www.kotei.hr`).** Trade-off: zero
  backend cost and simple deploys, at the price of no server-side logic;
  dynamic content must be client-fetched static JSON.
- **Content in `data/positions.json` rather than hardcoded HTML.** Trade-off:
  experience updates are data edits, not markup changes; the cost is a runtime
  fetch and a fetch-failure fallback path.
- **Vanilla JS with no build step.** Trade-off: no tooling to maintain and
  instant deploys, at the cost of no transpilation, bundling, or type safety.
  The formatter (below) is dev-only and never runs in the deploy path.
- **Prettier via npm for formatting.** Trade-off: consistent style and a
  `format:check` gate, at the cost of introducing `npm`/`node_modules` (dev
  only, git-ignored) into an otherwise dependency-free repo. Chose the full
  npm setup over on-demand `npx` for a pinned, reproducible toolchain.
- **Legacy template stack removed.** Trade-off: smaller, clearer repo; the
  history remains in git if any asset is ever needed again.
- **No test or lint tooling.** Trade-off: minimal friction for a small personal
  site; the cost is no automated safety net. Adding either is a user-approved
  decision.
