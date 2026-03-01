interface HeaderProps {
  pathname?: string;
}

export function Header({ pathname = '/' }: HeaderProps) {
  const isDocsActive = pathname.startsWith('/docs');

  return (
    <header className="border-b border-ash-border sticky top-0 z-50 bg-ash-bg/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <AshLogo />
          <span className="text-ash-text font-semibold tracking-tight group-hover:text-ash-accent transition-colors">
            ash
          </span>
        </a>

        <nav className="flex items-center gap-6">
          <a
            href="/docs/getting-started"
            className={[
              'text-sm transition-colors',
              isDocsActive ? 'text-ash-accent' : 'text-ash-muted hover:text-ash-text',
            ].join(' ')}
          >
            Docs
          </a>
          <a
            href="https://github.com/rocktree/ash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ash-muted hover:text-ash-text transition-colors flex items-center gap-1.5"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@rocktree/ash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-ash-accent text-white px-3 py-1.5 rounded-md hover:bg-ash-accent-hover transition-colors font-medium"
          >
            npm install
          </a>
        </nav>
      </div>
    </header>
  );
}

function AshLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" rx="4" fill="currentColor" className="text-ash-accent" opacity="0.2" />
      <path
        d="M6 14L8.5 7L11 12L13 9L15 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ash-accent"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
