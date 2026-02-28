import { EditorDemo } from '../ui/EditorDemo';
import { CopyButton } from '../ui/CopyButton';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

const INSTALL_CMD = 'npm install @rocktree/ash';

const QUICK_START = `import { useState } from 'react';
import { Editor } from '@rocktree/ash';

function App() {
  const [text, setText] = useState('');

  return (
    <Editor
      value={text}
      onChange={setText}
      placeholder="Start writing..."
      className="w-full h-64 p-4 bg-gray-900 text-gray-100
                 font-mono text-sm resize-none focus:outline-none"
    />
  );
}`;

const FEATURES = [
  {
    icon: '⌨',
    title: 'Keyboard first',
    description:
      'Full shortcut support. Bold, italic, indent, list continuation — without touching the mouse.',
  },
  {
    icon: '✦',
    title: 'Markdown-aware',
    description:
      'Knows you\'re writing markdown. Lists auto-continue. Shortcuts insert syntax, not rich text.',
  },
  {
    icon: '⚡',
    title: 'Featherweight',
    description:
      'One dependency: React. No bundled runtime, no heavy parser. Drops into any project without bloat.',
  },
  {
    icon: '◎',
    title: 'Fully unstyled',
    description:
      'Ash brings the brains, you bring the beauty. Pass a className and style it exactly how you want.',
  },
];

export function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 bg-ash-accent-dim text-ash-accent text-xs font-medium px-3 py-1.5 rounded-full border border-ash-accent/20 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-ash-accent inline-block animate-pulse" />
              Open source · v0.1.0
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-ash-text leading-[1.1] tracking-tight mb-6">
              Write like{' '}
              <span className="text-ash-accent">you code.</span>
            </h1>

            <p className="text-lg text-ash-muted leading-relaxed mb-8 max-w-xl">
              A keyboard-driven, markdown-aware text editor for React. Fast, minimal,
              and exactly what you'd expect from a developer tool.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 bg-ash-surface border border-ash-border rounded-lg px-4 py-2.5 font-mono text-sm">
                <span className="text-ash-accent select-none">$</span>
                <span className="text-ash-text">{INSTALL_CMD}</span>
                <CopyButton text={INSTALL_CMD} />
              </div>

              <a
                href="/docs/getting-started"
                className="text-sm text-ash-muted hover:text-ash-text transition-colors flex items-center gap-1"
              >
                Read the docs
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Live Editor Demo */}
          <div className="relative">
            <div className="absolute -inset-4 bg-ash-accent/5 rounded-2xl blur-2xl" />
            <div className="relative">
              <EditorDemo />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-ash-border">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature) => (
                <div key={feature.title}>
                  <div className="text-2xl mb-4">{feature.icon}</div>
                  <h3 className="text-ash-text font-semibold mb-2">{feature.title}</h3>
                  <p className="text-ash-muted text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="border-t border-ash-border">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-ash-text mb-2">Quick start</h2>
              <p className="text-ash-muted mb-8">
                Drop Ash into any React project in minutes.
              </p>

              <div className="space-y-4">
                <div className="rounded-lg border border-ash-border overflow-hidden">
                  <div className="bg-ash-surface border-b border-ash-border px-4 py-2.5 flex items-center justify-between">
                    <span className="text-ash-subtle text-xs font-mono">terminal</span>
                    <CopyButton text={INSTALL_CMD} />
                  </div>
                  <div className="bg-ash-editor px-4 py-4 font-mono text-sm">
                    <span className="text-ash-subtle">$ </span>
                    <span className="text-ash-green">{INSTALL_CMD}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-ash-border overflow-hidden">
                  <div className="bg-ash-surface border-b border-ash-border px-4 py-2.5 flex items-center justify-between">
                    <span className="text-ash-subtle text-xs font-mono">App.tsx</span>
                    <CopyButton text={QUICK_START} />
                  </div>
                  <pre className="bg-ash-editor px-4 py-4 overflow-x-auto">
                    <code className="text-sm font-mono text-ash-text leading-relaxed">
                      {QUICK_START}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="/docs/getting-started"
                  className="inline-flex items-center gap-2 text-sm text-ash-accent hover:text-ash-accent-hover transition-colors"
                >
                  View full documentation
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Phase 2 teaser */}
        <section className="border-t border-ash-border">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="bg-ash-surface border border-ash-border rounded-xl p-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-ash-amber text-xs font-medium mb-4">
                <span>◆</span>
                Coming in Phase 2
              </div>
              <h2 className="text-xl font-bold text-ash-text mb-3">
                AI-powered text operations
              </h2>
              <p className="text-ash-muted leading-relaxed text-sm">
                Rewrite, clean up, and format your text from the keyboard — powered by a
                pluggable AI service layer. No context switching, no copy-paste into a chatbot.
                Just write, and let Ash help you make it better.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
