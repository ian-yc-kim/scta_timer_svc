import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function read(path: string) {
  return readFileSync(resolve(path), 'utf-8');
}

describe('gear animation assets presence', () => {
  it('src/styles/gearAnimations.css contains required keyframes and classes', () => {
    const css = read('src/styles/gearAnimations.css');

    expect(css).toContain('@keyframes rotate');
    expect(css).toContain('.gear');
    expect(css).toContain('animation-play-state: paused');
    expect(css).toContain('.gear.running');
    expect(css).toContain('animation-play-state: running');
    expect(css).toContain('.gear.resetting');
    expect(css).toContain('animation: none');
    expect(css).toContain('--gear-initial-rotation');
    expect(css).toContain('will-change: transform');
    expect(css).toContain('transform: translateZ(0)');
  });

  it('index.html links stylesheet and module and contains gear demo elements', () => {
    const html = read('index.html');
    expect(html).toContain('/src/styles/gearAnimations.css');
    expect(html).toContain('/src/main.ts');

    // ensure at least one gear element present
    const gearRegex = /class=["']?[^>]*gear[^"'>]*/i;
    expect(gearRegex.test(html)).toBe(true);
  });
});
