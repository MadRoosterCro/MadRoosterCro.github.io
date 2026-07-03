# documentation/

Workflow artifact tree.

Lite feature:

```text
features/<slug>/work.md
```

Strict feature:

```text
features/<slug>/description.md
development-plans/<slug>/plan.md
features/<slug>/implementation-report.md
features/<slug>/test-report.md
```

Quick-fix report:

```text
changes/<name>.md
```

Rules:

- Use short kebab-case slugs/names.
- Link related artifacts at the top.
- Create `changes/<name>.md` only when `quick-fix` requires an audit trail.
