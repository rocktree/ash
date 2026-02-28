import { useState } from 'react';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="text-xs text-ash-subtle hover:text-ash-muted transition-colors font-mono"
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  );
}
