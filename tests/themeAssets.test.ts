import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function read(path: string) {
  return readFileSync(resolve(path), 'utf-8');
}

describe('theme assets presence', () => {
  it('theme.css defines core color variables', () => {
    const css = read('src/styles/theme.css');
    expect(css).toContain('--color-brown');
    expect(css).toContain('--color-gold');
    expect(css).toContain('--color-copper');

    // specific hex values
    expect(/--color-brown\s*:\s*#8B4513/i.test(css)).toBe(true);
    expect(/--color-gold\s*:\s*#FFD700/i.test(css)).toBe(true);
    expect(/--color-copper\s*:\s*#B87333/i.test(css)).toBe(true);
  });

  it('theme.css applies body background gradients and serif font', () => {
    const css = read('src/styles/theme.css');
    // background should include radial-gradient or linear-gradient
    const hasGradient = /radial-gradient|linear-gradient/i.test(css);
    expect(hasGradient).toBe(true);

    // font-family should include serif fallback
    expect(/font-family:\s*var\(--font-body\)/i.test(css)).toBe(true);
    expect(/serif/i.test(css)).toBe(true);
  });

  it('index.html links the theme stylesheet', () => {
    const html = read('index.html');
    expect(html).toContain('/src/styles/theme.css');
  });
});
