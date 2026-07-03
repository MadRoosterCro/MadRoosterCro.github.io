# CLAUDE.md

Workflow rules for Specline skills.

## Authority

- `PROJECT_MANIFEST.md` owns project facts: stack, commands, architecture,
  conventions, dependencies.
- `CLAUDE.md` owns process.
- On conflict: manifest wins on facts; this file wins on process.
- English only in committed code comments, docs, reports, and commit messages.

## Routing

- New capability -> `feature`.
- Bug, polish, refactor, review cleanup -> `quick-fix`.
- Formal requirements/design gates -> strict mode:
  `feature-description` -> `development-plan` -> `code-writing` ->
  `test-writing`.
- Missing or stale stack/tooling facts -> `project-manifest`.
- Status report -> `feature-status`.
- Artifact-aware audit -> `feature-review`.

Use the first route that matches the request and escalation gates.

## Hard Rules

- Do not invent requirements.
- Ask only blocking questions. Record default decisions with reason and
  provenance.
- Do not add dependencies without explicit user approval and manifest update.
- Do not change public contracts, persistence, security, privacy, or
  architecture without approval.
- Artifact text must be one of: decision, requirement, command, file,
  verification, or follow-up. Delete other prose.
- Keep code simple: direct control flow, clear names, no speculative layers.
- Keep docs in sync with code and manifest changes.

## Escalation Triggers

Pause or route to strict mode when work touches:

- dependency, package manager, build step, code generator, external service;
- public API, schema, migration, storage format, protocol, event contract;
- auth, permissions, secrets, payments, privacy, compliance, destructive action;
- architecture, concurrency model, background processing, deployment topology;
- product behavior not determined by request, manifest, or existing behavior;
- large unrelated diff;
- repeated verification failure that changes the plan.

Name the trigger and get explicit user approval before code changes.

## Verification

- Run commands from `PROJECT_MANIFEST.md`.
- Code/test changes end with applicable typecheck, lint, and tests.
- Formatter checks/fixes run only after code stabilizes, during final review or
  an explicit review pass.
- Run formatter commands directly, not through `rtk`.
- If formatting rewrites files, rerun affected typecheck/lint/tests.
- Never claim compile/test success without running the command, unless the
  manifest says no command exists.

## Checkpoints

Checkpoint output must include:

- changed paths;
- verification commands and outcomes;
- formatter result when run;
- deviations or follow-ups;
- remaining decisions.

Default checkpoints:

- `feature`: final checkpoint; earlier only for triggers or blocking questions.
- `quick-fix`: final checkpoint; earlier only for scope/risk change.
- strict skills: each phase boundary.
- `code-writing`: after a batch, risk boundary, plan-changing failure, or
  requested step-by-step review.

## Hook Gate

`hooks/spec-gate.cjs` enforces plan-before-code where supported.

- Free paths: `documentation/**`, `PROJECT_MANIFEST.md`, `CLAUDE.md`,
  `AGENTS.md`.
- First code/codebase edit in a session asks for human approval.
- One approval unlocks later code edits in that session.
- New session re-locks.
- Claude Code: reliable after plugin reload.
- Codex: trust via `/hooks`; `apply_patch` may bypass hook interception.

The hook is a backstop. Skill escalation gates still apply.

## Git

- Commit only when the engineer asks.
- Commit after the relevant checkpoint is approved.
- Message: `<type>(<slug-or-name>): <summary>`.
- Types: `feat`, `fix`, `test`, `docs`, `chore`.

## Dependencies

- Stack choices live in `PROJECT_MANIFEST.md`.
- Pre-existing dependencies need no retroactive approval.
- Any new runtime or dev dependency requires explicit approval and a manifest
  update.
