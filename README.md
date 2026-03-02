# Ash

A keyboard-driven, markdown-aware text editor component for React. Fast, minimal, and open source.

## What is Ash?

Ash is a React textarea component that enhances plain-text editing with markdown-aware keyboard shortcuts and smart list continuation. It's designed to feel like a native text input while adding just enough intelligence to make writing in markdown faster.

## Tech Stack

- **TypeScript** — strict types throughout
- **React 18** — component library target
- **tsup** — builds the package to ESM and CJS
- **Vitest** — unit tests with jsdom and React Testing Library
- **Astro** + **Tailwind CSS** — marketing site (`site/`)

## Project Structure

```
ash/
├── packages/
│   └── editor/          # @rocktree/ash — the publishable React component
│       ├── src/
│       │   ├── Editor.tsx   # Main component
│       │   ├── keymap.ts    # Keyboard shortcut handlers
│       │   ├── types.ts     # Exported TypeScript types
│       │   └── index.ts     # Package entry point
│       ├── tsup.config.ts
│       └── vitest.config.ts
└── site/                # Marketing and documentation website
    ├── src/
    │   ├── pages/       # Astro pages
    │   ├── components/  # UI components (React islands + Astro)
    │   ├── layouts/     # Astro layout wrappers
    │   └── styles/      # Global CSS
    └── astro.config.mjs
```

This is an npm workspaces monorepo. The `packages/editor` workspace is the library; `site` is the website.

## Local Development

Install dependencies from the repo root:

```bash
npm install
```

### Run the website

```bash
npm run dev
```

This starts the Astro dev server (via Netlify CLI) at `http://localhost:8888`. The site imports the editor directly from source, so changes to `packages/editor/src` are reflected immediately.

### Build the editor package

```bash
npm run build:editor
```

### Run tests

```bash
cd packages/editor
npm test
```
