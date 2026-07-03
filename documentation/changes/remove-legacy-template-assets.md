# Change: remove legacy template assets

Type: quick-fix (dead-code cleanup)

## Motivation

The live page (`index.html`) loads only `app.css`, `app.js`,
`data/positions.json`, `images/dario.png`, and `files/Dario-Car-Resume.pdf`.
The vendored template stack (Bootstrap, jQuery, FlexSlider, Owl Carousel,
icomoon, plus the Prepros SASS-compile config) was inherited from the original
theme and is not referenced anywhere in the live page. See
`PROJECT_MANIFEST.md` sections 4, 5, and 7.

## Verification before removal

- `git ls-files '*.html'` → only `index.html`.
- Repo-wide grep for `js/ css/ sass/ fonts/ bootstrap jquery flexslider owl
  icomoon prepros main.js` across `*.html/*.css/*.js/*.json/*.yml` (excluding
  the removed dirs) → no matches.
- `app.css` contains no `url(...)` or `@import` referencing the removed
  `fonts/` assets.

## Removed

- `css/` (Bootstrap, animate, FlexSlider, Owl Carousel, icomoon CSS)
- `js/` (jQuery, Bootstrap, plugins, legacy `main.js`)
- `sass/` (Bootstrap SASS sources + `style.scss`)
- `fonts/` (Bootstrap + icomoon fonts)
- `prepros-6.config` (Prepros SASS build config for the legacy `sass/` tree)

Total: ~2.3 MB of unreferenced assets.

## Not touched (out of scope; flagged for follow-up)

- `images/{about,alone,cover_bg_1,sraka}.jpg`, `images/loc.png` — unreferenced
  legacy imagery (~1.9 MB). `images/dario.png` is the live avatar and stays.
- Tracked `.DS_Store` files (macOS cruft; candidate for `.gitignore` + untrack).
- `_config.yml` (`theme: jekyll-theme-midnight`) — inert for the front-matter-
  free `index.html`, left in place to avoid changing GitHub Pages behavior.

## Verification after removal

- `git status` shows the deletions staged; live entry points
  (`index.html`, `app.css`, `app.js`, `data/`, `files/`, `images/dario.png`)
  intact.
- Manual check owner: serve statically and confirm the page still renders,
  paginates, and downloads the resume.
