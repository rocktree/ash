export function Footer() {
  return (
    <footer className="border-t border-ash-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-ash-subtle text-sm font-medium">ash</span>
          <span className="text-ash-subtle text-xs">by</span>
          <a
            href="https://rocktree.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ash-muted hover:text-ash-text text-sm transition-colors"
          >
            Rocktree
          </a>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="/docs/getting-started"
            className="text-sm text-ash-subtle hover:text-ash-muted transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/rocktree/ash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ash-subtle hover:text-ash-muted transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@rocktree/ash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ash-subtle hover:text-ash-muted transition-colors"
          >
            npm
          </a>
        </div>
      </div>
    </footer>
  );
}
