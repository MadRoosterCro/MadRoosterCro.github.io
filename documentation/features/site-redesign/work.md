# Feature: Editorial personal-site redesign

Slug: site-redesign

## Related artifacts

- Design handoff: `/Users/dariocar/Downloads/design_handoff_personal_site`
  (`README.md` spec, `dario-site-standalone.html` render, `assets/dario.png`).
- `PROJECT_MANIFEST.md` §3–§6 (architecture, structure, data flow).

## Goal

Replace the current bare CV page with the high-fidelity "warm editorial"
one-pager from the design handoff: sticky nav → hero → about → SpecLine
feature → experience → contact → footer, with scroll-reveal and hover motion.

- **Value:** premium, personable presentation while staying minimal and static.
- **Non-goals:** no backend, no build step, no framework, no new npm runtime
  dependency, no test framework introduction. Experience stays sourced from
  `data/positions.json`.

## Requirements

- **FR1** Single centered column, `max-width 1120px`, page bg `#faf8f4`,
  section padding `64px` desktop / `26px` at ≤800px, square corners.
- **FR2** Sticky translucent nav (blur, bottom border) with wordmark left;
  Experience / SpecLine / Contact anchors + "Resume ↗" right; animated
  left-to-right underline on hover; anchors scroll to `#experience`,
  `#speclne`, `#contact`.
- **FR3** Hero: 2-col `1.35fr 1fr` grid; kicker, H1 "Let's build great
  products." (Instrument Serif 88px, "products." italic terracotta, break after
  "build"), lead paragraph, primary "Get in touch" (→ `#contact`) + secondary
  "Download resume" (→ resume PDF) buttons with `translateY(-2px)` hover;
  portrait in a `4/5` box, `object-position: center 22%`, border + soft shadow.
- **FR4** About: `220px 1fr` grid, top border, label + Instrument Serif 32px
  statement (copy per handoff).
- **FR5** SpecLine dark card (`#1a1714`) at `#speclne`: "Currently building"
  label, "private · open-sourcing soon" meta, title, body copy per handoff.
- **FR6** Experience at `#experience`: `220px 1fr` grid, "Experience" label,
  one group per employer from `data/positions.json` — header shows role
  (20/500), employer + optional note (terracotta), month-year range on the
  right (Space Mono); nested client engagements each show client (bold),
  title·location (muted), a description, and a tech-stack line (Space Mono).
  Direct jobs show description + stack under the header. Hairline group borders.
- **FR7** Contact band (`#f0ebe2`) at `#contact`: "Let's talk" label + big
  "Say hello →" `mailto:dario.car.kz@gmail.com` (arrow terracotta, email NOT
  shown on page); right-side "Resume ↗" link. No LinkedIn anywhere.
- **FR8** Footer: "© Dario Car" / "Built with care · 2026" (dynamic year).
- **FR9** Scroll reveal: `[data-reveal]` elements fade/translate in via
  IntersectionObserver (threshold 0.15, rootMargin `0px 0px -8% 0px`,
  `0.8s cubic-bezier(0.16,1,0.3,1)`, staggered `min(i,6)*55ms`, reveal once);
  fallback reveals all if IO is unavailable. `scroll-behavior: smooth`.
- **FR10** Responsive ≤800px: hero → 1 col with photo first (`order:-1`, max
  300px), H1 52px, label/content grids → 1 col, about 24px, contact stacks,
  padding 26px.
- **FR11** Design tokens (colors, three Google Fonts, spacing, easing) applied
  per handoff.

## Assumptions & Decisions

1. **Experience rewritten to match the latest CV.** `data/positions.json`
   moved to an employer→engagement schema (`employer`, `role`, optional `note`,
   `start`/`end`, then `engagements[]` of `client`/`title`/`location`/
   `description`/`stack[]`, or a direct `description`+`stack[]`). Renderer shows
   role + employer header with a month-year date range, nested client
   engagements with descriptions and tech stacks. Older roles not on the CV
   (ROKO Labs, volunteer/NGO/logistics) were dropped; the highlight-bullet
   format was superseded. Resume PDF replaced with the latest CV. `User-confirmed`.
2. **LinkedIn removed** entirely; contact is mailto-only. `User-confirmed`.
3. **Fonts via Google Fonts CDN** (`fonts.googleapis.com`). `User-confirmed`.
4. Experience dates rendered **year-only** (e.g. `2026 — Now`), `Present`
   mapped to `Now`, to match the handoff's Space Mono date style. `Sensible default`.
5. Portrait uses the handoff's `assets/dario.png` copied to `images/dario.png`
   (design was tuned to it: `object-position center 22%`). `Sensible default`.
6. Resume links point at existing `files/Dario-Car-Resume.pdf`. `Manifest convention`.
7. No LinkedIn/`aria-live`/load-more DOM ids remain; `app.js` keeps its
   fetch + defensive rendering, rewritten for the new row markup. `Manifest convention`.

## Escalation triggers (stop gate)

- **External service:** Google Fonts CDN added to the page — approved (Decision 3).
- **Product behavior / large diff:** full redesign rewriting `index.html`,
  `app.css`, `app.js` and removing LinkedIn — this is the explicit request;
  approved via decisions above and the redesign go-ahead.

No new npm dependency; no persistence/schema/auth change (`data/positions.json`
shape is unchanged).

## Implementation Plan

1. Copy handoff `assets/dario.png` → `images/dario.png`.
2. Rewrite `index.html`: Google Fonts `<link>`s, full section markup
   (nav/hero/about/speclne/experience/contact/footer), `data-reveal` hooks,
   `#positions` container, `#year` span. Remove `#loadMore`, LinkedIn links.
3. Rewrite `app.css`: tokens, layout grids, typography, nav/button hover
   underline+lift, portrait, dark card, contact band, responsive ≤800px,
   reveal base/visible states.
4. Rewrite `app.js`: keep the `fetch(positions.json)` + defensive helpers;
   render one minimal row per position (title, company·location, year range),
   no grouping/highlights/pagination; set footer year; wire the
   IntersectionObserver reveal with fallback.
5. Manifest follow-up: update §1/§3/§5/§6/§7 (new sections, Google Fonts
   external resource, removed load-more/LinkedIn, year-only dates).

## Files Changed

- `index.html` — production: new page structure + fonts. (rewrite)
- `app.css` — production: full design system. (rewrite)
- `app.js` — production: restyled data-driven experience + reveal. (rewrite)
- `images/dario.png` — asset: handoff portrait. (replace)
- `PROJECT_MANIFEST.md` — docs: reflect redesign. (update)
- `documentation/features/site-redesign/work.md` — this artifact.

## Verification

- `npm run format:check` → PASS (all files Prettier-clean).
- `node --check app.js` → PASS.
- `node -e "require('./data/positions.json').length"` → 11 (JSON intact).
- All referenced local assets exist (`app.css`, `app.js`, `images/dario.png`,
  `files/Dario-Car-Resume.pdf`, `data/positions.json`).
- DOM-stub smoke test of the real `app.js` against live data → 11 rows,
  correct year ranges (`Present`→`Now`), `company · location` metadata, footer
  year set, no-IntersectionObserver fallback ran clean. (FR6, FR8, FR9-fallback.)
- Pending manual (owner): serve statically and confirm in a real browser —
  fonts load, nav anchors scroll, hover underline/lift, reveal fires on scroll,
  resume downloads, and ≤800px layout collapses. (FR1–FR5, FR7, FR9-live, FR10.)
- FR-to-code: FR1–FR5/FR7/FR10/FR11 → `index.html` + `app.css`; FR6/FR8/FR9 →
  `app.js` (`renderPositions`, `formatYear`, `createRevealer`).

## Deviations & Follow-ups

- No automated tests added (no test framework; manifest §8 gap unchanged).
- Company names in Experience come from real data, not the handoff's
  `[Company]` placeholders (Decision 1).
- SpecLine copy shipped as written in the handoff; add a public repo link when
  available (handoff open item).
- The design mock shows ~3 experience rows; real data yields 11 (incl. early
  volunteer/logistics roles back to 2008). Left complete per Decision 1 — curate
  `data/positions.json` if a shorter list is preferred.
- Reduced-motion users get instant reveal + no hover transitions
  (`prefers-reduced-motion`), a small accessibility addition beyond the handoff.
