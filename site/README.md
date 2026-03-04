# Ash Site

The marketing and documentation website for [Ash](../packages/editor), the keyboard-driven React text editor. Built with Astro and deployed to Netlify.

## Tech Stack

- **Astro 5** — static site framework with React island support
- **React 18** — interactive components via `client:load`
- **Tailwind CSS v4** — utility-first styling via the Vite plugin
- **TypeScript** — type checking via `astro check`
- **Netlify** — hosting (deployed via `netlify.toml`)

## Local Development

Install dependencies from the **repo root** (this project uses npm workspaces):

```bash
# From repo root
npm install
```

Start the dev server:

```bash
npm run dev
# or from within site/
npm run dev
```

The site runs at `http://localhost:4321`.

The editor package is aliased directly to its TypeScript source (`packages/editor/src/index.ts`) during development, so edits to the editor are reflected without a separate build step.

## Build

```bash
npm run build
```

Output is written to `site/dist/`. The Netlify build config is in `netlify.toml`.

## Type Checking

```bash
npm run check
```

## Testing

The site has meta tag integration tests that verify OG and Twitter Card tags are present in the built HTML. They require a built `dist/` to exist:

```bash
npm test
# Runs astro build then vitest
```

To run tests against an existing build:

```bash
npm run build
npx vitest run
```

## Social Preview Validation

OG meta tags have been verified using:
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) — image and title render correctly
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — preview shows OG image and description

Last validated: 2026-03-04 against https://ash.rocktree.ai

## Environment Variables

No environment variables are required to run the site locally.
