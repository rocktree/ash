import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, '../dist/index.html'), 'utf-8');

describe('OG and Twitter meta tags', () => {
  it('has og:image', () => {
    expect(html).toContain('property="og:image"');
  });

  it('has og:title', () => {
    expect(html).toContain('property="og:title"');
  });

  it('has og:description', () => {
    expect(html).toContain('property="og:description"');
  });

  it('has og:url set to site root', () => {
    expect(html).toContain('property="og:url" content="https://ash.rocktree.ai"');
  });

  it('has og:type set to website', () => {
    expect(html).toContain('property="og:type" content="website"');
  });

  it('has twitter:card set to summary_large_image', () => {
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('has twitter:image', () => {
    expect(html).toContain('name="twitter:image"');
  });
});
