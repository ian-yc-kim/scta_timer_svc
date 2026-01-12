import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function read(path: string) {
  return readFileSync(resolve(path), 'utf-8');
}

describe('components assets presence', () => {
  it('components.css exists and contains steampunk selectors', () => {
    const css = read('src/styles/components.css');
    expect(css).toContain('.steampunk-btn');
    expect(css).toContain('.steampunk-btn:hover');
    expect(css).toContain('.steampunk-btn:active');
    expect(css).toContain('.clock-face');
    expect(css).toMatch(/@media/i);
    // control-bar should be moved into components.css
    expect(css).toContain('.control-bar');
  });

  it('index.html links components.css and contains clock-face and button classes', () => {
    const html = read('index.html');
    expect(html).toContain('/src/styles/components.css');
    expect(html).toContain('class="clock-face"');
    expect(html).toContain('class="steampunk-btn"');
    expect(html).toContain('id="start-btn"');
    expect(html).toContain('id="pause-btn"');
    expect(html).toContain('id="reset-btn"');
  });
});
