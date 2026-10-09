import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SAVE_KEY } from '../childrens-corner/little-garden/engine.mjs';

class Element {
  constructor() { this.hidden = false; this.attributes = {}; this.events = {}; this.textContent = ''; }
  setAttribute(name, value) { this.attributes[name] = value; }
  toggleAttribute(name, force) { if (force) this.attributes[name] = ''; else delete this.attributes[name]; }
  addEventListener(name, callback) { this.events[name] = callback; }
  focus() { globalThis.document.activeElement = this; }
  click() { this.events.click?.(); }
}

async function visit(storage, key, run, blockedGetter = false) {
  const html = await readFile(new URL('../childrens-corner/little-garden/index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const nodes = Object.fromEntries(ids.map(id => [id, new Element()]));
  const previousDocument = globalThis.document;
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  globalThis.document = { getElementById: id => nodes[id] };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { if (blockedGetter) throw new Error('unavailable'); return storage; } });
  try {
    await import(`../childrens-corner/little-garden/garden.mjs?test=${key}`);
    await run(nodes);
  } finally {
    globalThis.document = previousDocument;
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
  }
}

test('garden controls grow the selected flower, reveal discoveries, and reset focus', async () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  await visit(storage, 'grow', nodes => {
    assert.equal(nodes.garden.hidden, false);
    assert.equal(nodes['seed-choices'].hidden, false);
    nodes.gold.click();
    assert.equal(nodes.gold.attributes['aria-pressed'], 'true');
    assert.equal(nodes.pink.attributes['aria-pressed'], 'false');
    nodes.primary.focus(); nodes.primary.click();
    assert.equal(nodes['seed-choices'].hidden, true);
    assert.equal(document.activeElement, nodes.primary);
    assert.equal(nodes.primary.textContent, 'Check the soil');
    nodes.look.click();
    assert.equal(nodes.discovery.hidden, false);
    assert.ok(nodes['discovery-text'].textContent.includes('butterfly'));
    nodes.primary.click();
    assert.equal(nodes.primary.textContent, 'Give a gentle drink');
    nodes.primary.click();
    assert.equal(nodes.primary.textContent, 'Visit the next story day');
    assert.equal('hidden' in nodes.drink.attributes, false);
    nodes.primary.click();
    assert.equal(nodes.discovery.hidden, true);
    nodes.primary.click();
    assert.equal(nodes.primary.textContent, 'Visit the next story day');
    assert.ok(nodes.message.textContent.includes('still damp'));
    for (let i = 0; i < 20 && nodes.primary.textContent !== 'Plant another seed'; i++) nodes.primary.click();
    assert.equal(nodes.primary.textContent, 'Plant another seed');
    assert.equal(nodes.finished.hidden, false);
    assert.equal('hidden' in nodes.flower.attributes, false);
    assert.equal('hidden' in nodes.bud.attributes, true);
    assert.equal(nodes.bloom.attributes.color, '#f3c861');
    assert.ok(nodes['scene-description'].textContent.includes('five-petalled golden flower'));
    assert.equal(JSON.parse(values.get(SAVE_KEY)).day, 6);
    nodes.primary.click();
    assert.equal(nodes.finished.hidden, true);
    assert.equal(nodes['seed-choices'].hidden, false);
    assert.equal(document.activeElement, nodes.pink);
    assert.equal(nodes.primary.textContent, 'Plant my seed');
    assert.equal(JSON.parse(values.get(SAVE_KEY)).day, 0);
    nodes.primary.click(); nodes.reset.click();
    assert.equal(document.activeElement, nodes.pink);
    assert.equal(nodes['seed-choices'].hidden, false);
  });
});

test('a return visit restores the stage, water step, selected flower, and scene', async () => {
  let saved = JSON.stringify({ version: 1, seed: 'pink', day: 3, checked: true, watered: false });
  await visit({ getItem: () => saved, setItem: (key, value) => { saved = value; } }, 'restore', nodes => {
    assert.equal(nodes['day-count'].textContent, 'Story day 3 of 6');
    assert.equal(nodes.primary.textContent, 'Give a gentle drink');
    assert.ok(nodes.message.textContent.includes('Welcome back'));
    assert.equal('hidden' in nodes.shoot.attributes, false);
    assert.equal('hidden' in nodes.flower.attributes, true);
    assert.equal(nodes['seed-choices'].hidden, true);
    assert.equal(nodes.bloom.attributes.color, '#f5b8ae');
    nodes.primary.click();
    assert.equal(JSON.parse(saved).watered, true);
    assert.equal(JSON.parse(saved).day, 3);
  });
});

test('a blocked storage getter still allows the game, discoveries, and new gardens', async () => {
  await visit(undefined, 'blocked', nodes => {
    assert.equal(nodes.garden.hidden, false);
    assert.ok(nodes['save-note'].textContent.includes('for this visit'));
    nodes.primary.click(); nodes.primary.click(); nodes.primary.click();
    assert.equal(nodes.primary.textContent, 'Visit the next story day');
    nodes.look.click();
    assert.equal(nodes.discovery.hidden, false);
    nodes.reset.click();
    assert.equal(nodes.primary.textContent, 'Plant my seed');
    assert.equal(document.activeElement, nodes.pink);
  }, true);
});
