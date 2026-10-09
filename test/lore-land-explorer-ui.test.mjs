import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createExplorer, SAVE_KEY } from '../childrens-corner/lore-land-explorer/engine.mjs';

class Element {
  constructor() {
    this.hidden = false; this.open = false; this.attributes = {}; this.dataset = {}; this.events = {}; this.children = []; this.parts = {};
    this.style = { setProperty: (name, value) => { this.attributes[name] = value; } };
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { this.events[name] = callback; }
  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  focus() { document.activeElement = this; }
  click() { this.events.click?.(); }
  showModal() { this.open = true; document.getElementById('close-discovery').focus(); }
  close() { this.open = false; this.events.close?.(); }
  set innerHTML(value) { this.markup = value; for (const selector of ['strong', 'small']) this.parts[selector] = new Element(); }
  querySelector(selector) { return this.parts[selector]; }
}

async function visit(key, options, run) {
  const html = await readFile(new URL('../childrens-corner/lore-land-explorer/index.html', import.meta.url), 'utf8');
  const nodes = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(match => [match[1], new Element()]));
  nodes['read-aloud'].hidden = true; nodes.compatibility.hidden = true;
  if (options.noDialog) nodes['discovery-dialog'].showModal = undefined;
  const names = ['document', 'localStorage', 'speechSynthesis', 'SpeechSynthesisUtterance', 'location', 'history', 'addEventListener'];
  const previous = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const values = new Map(); if (options.record) values.set(SAVE_KEY, JSON.stringify(options.record));
  const events = {}; const spoken = []; let cancelled = 0;
  const bindings = {
    document: { getElementById: id => nodes[id], createElement: () => new Element(), addEventListener: (name, callback) => { events[name] = callback; } },
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
    speechSynthesis: options.speech ? { getVoices: () => [], speak: utterance => spoken.push(utterance), cancel: () => cancelled++ } : undefined,
    SpeechSynthesisUtterance: options.speech ? class { constructor(text) { this.text = text; } } : undefined,
    location: { hash: options.hash ?? '' },
    history: { replaceState: (state, title, hash) => { globalThis.location.hash = hash; } },
    addEventListener: (name, callback) => { events[name] = callback; }
  };
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: bindings[name] });
  if (options.blocked) Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  try {
    await import(`../childrens-corner/lore-land-explorer/explorer.mjs?test=${key}`);
    await run({ nodes, values, spoken, events, cancelled: () => cancelled });
  } finally {
    for (const name of names) { if (previous[name]) Object.defineProperty(globalThis, name, previous[name]); else delete globalThis[name]; }
  }
}

test('picture and list controls open stories, stop speech, return focus, complete all lands, and replay one', async () => {
  await visit('explore', { speech: true }, ({ nodes, values, spoken, cancelled, events }) => {
    assert.equal(nodes.explorer.hidden, false);
    assert.equal(nodes['land-picker'].children.length, 3);
    assert.equal(nodes.pins.children.length, 5);
    assert.equal(nodes.discoveries.children.length, 5);
    assert.equal(spoken.length, 0);
    assert.equal(nodes['read-aloud'].hidden, false);
    const first = nodes.pins.children[0];
    first.click();
    assert.equal(nodes['discovery-dialog'].open, true);
    assert.equal(nodes['discovery-title'].textContent, 'Blue Toby');
    assert.equal(document.activeElement, nodes['discovery-title']);
    assert.equal(first.dataset.found, 'true');
    assert.equal(nodes.discoveries.children[0].dataset.found, 'true');
    nodes['read-aloud'].click();
    assert.equal(spoken.length, 1);
    assert.equal(nodes['read-aloud'].textContent, 'Stop reading');
    nodes['close-discovery'].click();
    assert.equal(cancelled(), 1);
    assert.equal(document.activeElement, first);
    assert.equal(nodes['read-aloud'].textContent, 'Read to me');
    first.click(); nodes['close-top'].click();
    assert.ok(nodes.progress.textContent.startsWith('1 of 5'));
    for (let land = 0; land < 3; land++) {
      for (const button of nodes.discoveries.children) { button.click(); nodes['close-discovery'].click(); assert.equal(document.activeElement, button); }
      assert.equal(nodes.finished.hidden, false);
      if (land < 2) { nodes['next-land'].click(); assert.equal(document.activeElement, nodes['land-picker'].children[land + 1]); }
    }
    assert.equal(nodes['finish-title'].textContent, 'All three lands explored!');
    assert.ok(nodes.progress.textContent.includes('15 of 15'));
    assert.equal(JSON.parse(values.get(SAVE_KEY)).land, 'little-pond');
    nodes.reset.click();
    assert.equal(nodes.finished.hidden, true);
    assert.ok(nodes.progress.textContent.includes('10 of 15'));
    assert.equal(document.activeElement, nodes.pins.children[0]);
    nodes.pins.children[0].click(); nodes['read-aloud'].click();
    events.pagehide();
    assert.equal(cancelled(), 2);
    nodes['close-discovery'].click();
    nodes['land-picker'].children[0].click();
    assert.ok(nodes.pins.children.every(pin => pin.dataset.found === 'true'));
    assert.equal(location.hash, '#lantern-garden');
  });
});

test('deep links select a land while preserving saved discoveries and image/story links', async () => {
  const saved = createExplorer(); saved.discover('lotus');
  await visit('restore', { record: saved.serialize(), hash: '#leafy-path' }, ({ nodes, events }) => {
    assert.equal(nodes['land-title'].textContent, 'Leafy Path');
    assert.equal(nodes['land-image'].attributes.src, '../art/lore-land-kind-step.webp');
    assert.equal(nodes['land-story'].attributes.href, '../lore-lands.html#kind-step');
    assert.equal(nodes['read-aloud'].hidden, true);
    assert.ok(nodes.progress.textContent.includes('1 of 15'));
    nodes['land-picker'].children[0].click();
    assert.equal(nodes.pins.children[4].dataset.found, 'true');
    location.hash = '#little-pond'; events.hashchange();
    assert.equal(nodes['land-title'].textContent, 'Little Pond');
    location.hash = '#unknown'; events.hashchange();
    assert.equal(nodes['land-title'].textContent, 'Little Pond');
  });
});

test('blocked storage and unavailable speech keep the explorer playable', async () => {
  await visit('blocked', { blocked: true }, ({ nodes }) => {
    assert.ok(nodes['save-note'].textContent.includes('for this visit'));
    assert.equal(nodes['read-aloud'].hidden, true);
    nodes.discoveries.children[3].click();
    assert.equal(nodes['discovery-title'].textContent, 'Golden lantern');
    nodes['close-discovery'].click();
    assert.ok(nodes.progress.textContent.startsWith('1 of 5'));
    nodes.reset.click();
    assert.ok(nodes.progress.textContent.startsWith('0 of 5'));
  });
});

test('browsers without native dialogs receive the picture-story fallback', async () => {
  await visit('compatibility', { noDialog: true }, ({ nodes }) => {
    assert.equal(nodes.compatibility.hidden, false);
    assert.equal(nodes['land-picker'].children.length, 0);
  });
});
