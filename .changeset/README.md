# Changesets

This directory holds changeset files that describe unreleased changes.

## Format

Each changeset is a markdown file with YAML frontmatter:

```markdown
---
bump: minor
---

Add keyboard shortcut support for bold and italic
```

The `bump` field must be one of: `patch`, `minor`, or `major`.

The body is a human-readable summary that will appear in the CHANGELOG.

## When to create a changeset

Every PR that changes the `@rocktree/ash` package (`packages/editor/`) should include a changeset file. Name it something descriptive (e.g., `add-bold-shortcut.md`).

PRs that only change the site, docs, or CI do not need changesets.

## How releases work

1. Changesets accumulate on `main` as PRs merge.
2. A GitHub Action opens a "Release @rocktree/ash" PR that bumps the version, updates the CHANGELOG, and deletes consumed changeset files.
3. Merging that PR publishes to npm and creates a GitHub release.
