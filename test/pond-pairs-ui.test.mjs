import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// A small DOM double runs the actual controller; no browser or network is needed.
class Element {
  constructor() { this.hidden = false; this.dataset = {}; this.attributes = {}; this.children = []; this.events = {}; this.parts = {}; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.events[name] = callback; }
  append(child) { this.children.push(child); }
  focus() { globalThis.document.activeElement = this; }
  click() { this.events.click?.(); }
  set innerHTML(value) {
    this.markup = value;
    for (const selector of ['.card-back', '.card-front', '.card-front use', '.friend-name', '.match-label']) this.parts[selector] = new Element();
  }
  querySelector(selector) { return this.parts[selector]; }
}

test('the game controller reveals, compares, returns focus, wins, and restarts', async () => {
  const html = await readFile(new URL('../childrens-corner/pond-pairs/index.html', import.meta.url), 'utf8');
  const nodes = Object.fromEntries(['game', 'cards', 'message', 'progress', 'continue', 'restart', 'win'].map(id => {
    assert.ok(html.includes(`id="${id}"`), `HTML contains ${id}`);
    return [id, new Element()];
  }));
  const previousDocument = globalThis.document;
  const previousRandom = Math.random;
  globalThis.document = { getElementById: id => nodes[id], createElement: () => new Element() };
  Math.random = () => 0.999999;
  try {
    await import('../childrens-corner/pond-pairs/game.mjs');
    const cards = nodes.cards.children;
    assert.equal(cards.length, 6);
    assert.equal(nodes.game.hidden, false);
    assert.equal(nodes.continue.hidden, true);
    assert.equal(nodes.win.hidden, true);
    assert.ok(cards.every(card => card.attributes['aria-label'].endsWith('face down')));
    cards[0].click();
    assert.equal(cards[0].querySelector('.card-front').hidden, false);
    assert.ok(cards[0].attributes['aria-label'].includes('Blue Toby'));
    assert.equal(cards[0].attributes['aria-pressed'], 'true');
    cards[2].click();
    assert.equal(nodes.continue.hidden, false);
    assert.equal(document.activeElement, nodes.continue);
    assert.ok(cards.every(card => card.attributes['aria-disabled'] === 'true'));
    cards[4].click();
    assert.equal(cards[4].dataset.state, 'hidden');
    nodes.continue.click();
    assert.equal(nodes.continue.hidden, true);
    assert.equal(document.activeElement, cards[0]);
    assert.ok(cards.every(card => card.dataset.state === 'hidden'));
    for (let i = 0; i < 6; i += 2) { cards[i].click(); cards[i + 1].click(); }
    assert.equal(nodes.progress.textContent, '3 of 3 pairs found');
    assert.equal(nodes.win.hidden, false);
    assert.ok(nodes.message.textContent.includes('all three pairs'));
    assert.ok(cards.every(card => card.querySelector('.match-label').hidden === false));
    nodes.restart.click();
    assert.equal(nodes.progress.textContent, '0 of 3 pairs found');
    assert.equal(nodes.win.hidden, true);
    assert.equal(nodes.continue.hidden, true);
    assert.equal(document.activeElement, cards[0]);
    assert.ok(cards.every(card => card.attributes['aria-pressed'] === 'false'));
    assert.ok(cards.every(card => card.querySelector('.card-front').hidden));
  } finally {
    globalThis.document = previousDocument;
    Math.random = previousRandom;
  }
});
