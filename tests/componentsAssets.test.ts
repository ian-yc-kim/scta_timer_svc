import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function read(path: string) {
  return readFileSync(resolve(path), 'utf-8');
}

describe('components assets presence', () => {
  it('components.css exists and contains steampunk selectors and clock hand selectors', () => {
    const css = read('src/styles/components.css');
    expect(css).toContain('.steampunk-btn');
    expect(css).toContain('.steampunk-btn:hover');
    expect(css).toContain('.steampunk-btn:active');
    expect(css).toContain('.clock-face');
    expect(css).toMatch(/@media/i);
    expect(css).toContain('.control-bar');

    // New analog clock selectors
    expect(css).toContain('.hand');
    expect(css).toContain('.hour-hand');
    expect(css).toContain('.minute-hand');
    expect(css).toContain('.center-cap');
    expect(css).toContain('transition: transform');
    expect(css).toContain('.clock-face.mode-work');
    expect(css).toContain('.clock-face.mode-break');
  });

  it('index.html updated and contains clock-hands and gear elements and new title', () => {
    const html = read('index.html');
    expect(html).toContain('/src/styles/components.css');
    expect(html).toContain('class="clock-face"');
    expect(html).toContain('class="steampunk-btn"');
    expect(html).toContain('id="start-btn"');
    expect(html).toContain('id="pause-btn"');
    expect(html).toContain('id="reset-btn"');

    // New checks
    expect(html).toContain('<title>Steampunk Timer</title>');
    expect(html).toContain('id="clock-hands"');
    expect(html).toContain('class="hand hour-hand"');
    expect(html).toContain('class="hand minute-hand"');
    expect(html).toContain('class="center-cap"');

    // Ensure demo-row is removed
    expect(html.includes('demo-row')).toBe(false);

    // At least one gear element should remain
    const gearRegex = /class=["']?[^>]*\bgear\b[^"'>]*/i;
    expect(gearRegex.test(html)).toBe(true);
  });
});
