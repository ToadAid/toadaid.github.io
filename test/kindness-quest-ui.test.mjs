import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SAVE_KEY } from '../childrens-corner/kindness-quest/engine.mjs';

class Element {
  constructor() { this.hidden = false; this.attributes = {}; this.events = {}; this.children = []; this.textContent = ''; }
  setAttribute(name, value) { this.attributes[name] = value; }
  toggleAttribute(name, force) { if (force) this.attributes[name] = ''; else delete this.attributes[name]; }
  addEventListener(name, callback) { this.events[name] = callback; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  focus() { document.activeElement = this; }
  click() { this.events.click?.(); }
}

async function visit(key, options, run) {
  const html = await readFile(new URL('../childrens-corner/kindness-quest/index.html', import.meta.url), 'utf8');
  const nodes = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(match => [match[1], new Element()]));
  const names = ['document', 'localStorage', 'speechSynthesis', 'SpeechSynthesisUtterance', 'addEventListener'];
  const previous = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const values = new Map(); if (options.record) values.set(SAVE_KEY, JSON.stringify(options.record));
  const events = {}; const spoken = []; let cancelled = 0;
  const bindings = {
    document: { getElementById: id => nodes[id], createElement: () => new Element(), addEventListener: (name, callback) => { events[name] = callback; } },
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
    speechSynthesis: options.speech ? { getVoices: () => [], speak: utterance => spoken.push(utterance), cancel: () => cancelled++ } : undefined,
    SpeechSynthesisUtterance: options.speech ? class { constructor(text) { this.text = text; } } : undefined,
    addEventListener: (name, callback) => { events[name] = callback; }
  };
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: bindings[name] });
  if (options.blocked) Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  try {
    await import(`../childrens-corner/kindness-quest/quest.mjs?test=${key}`);
    await run({ nodes, values, events, spoken, cancelled: () => cancelled });
  } finally {
    for (const name of names) { if (previous[name]) Object.defineProperty(globalThis, name, previous[name]); else delete globalThis[name]; }
  }
}

test('choices reveal results, move reading focus, retry, finish, and replay', async () => {
  await visit('play', {}, ({ nodes, values }) => {
    assert.equal(nodes.quest.hidden, false);
    assert.equal(nodes.choices.children.length, 2);
    assert.equal(nodes.next.hidden, true);
    nodes.next.click();
    assert.equal(nodes.choices.children.length, 2);
    nodes.choices.children[1].click();
    assert.equal(nodes.result.hidden, false);
    assert.ok(nodes['result-story'].textContent.includes('watch first'));
    assert.equal(document.activeElement, nodes['result-title']);
    assert.equal(nodes.choices.hidden, true);
    nodes.retry.click();
    assert.equal(nodes.choices.hidden, false);
    assert.equal(document.activeElement, nodes.choices.children[0]);
    nodes.choices.children[0].click(); nodes.next.click();
    assert.equal(document.activeElement, nodes['moment-title']);
    assert.ok(nodes.progress.textContent.includes('Moment 2'));
    nodes.choices.children[0].click(); nodes.next.click();
    nodes.choices.children[0].click(); nodes.next.click();
    assert.equal(nodes.ending.hidden, false);
    assert.equal(nodes['play-again'].hidden, false);
    assert.equal(nodes.next.hidden, true);
    assert.equal('hidden' in nodes['shared-petal'].attributes, false);
    assert.ok(nodes['ending-story'].textContent.includes('places it gently'));
    assert.equal(JSON.parse(values.get(SAVE_KEY)).step, 3);
    nodes.back.click();
    assert.equal(nodes.result.hidden, false);
    nodes.retry.click(); nodes.choices.children[1].click(); nodes.next.click();
    assert.ok(nodes['ending-story'].textContent.includes('watching'));
    assert.equal('hidden' in nodes['shared-petal'].attributes, true);
    nodes['play-again'].click();
    assert.equal(nodes.choices.children.length, 2);
    assert.equal(document.activeElement, nodes['moment-title']);
    assert.equal(nodes.ending.hidden, true);
    assert.deepEqual(JSON.parse(values.get(SAVE_KEY)).choices, [null, null, null]);
  });
});

test('a saved result restores the appropriate view and keeps earlier choices when going back', async () => {
  await visit('restore', { record: { version: 1, step: 1, choices: ['job', 'all-rules', null] } }, ({ nodes, values }) => {
    assert.equal(nodes.result.hidden, false);
    assert.equal(nodes.choices.hidden, true);
    assert.ok(nodes['result-story'].textContent.includes('a lot to remember'));
    nodes.back.click();
    assert.ok(nodes['result-story'].textContent.includes('watch first'));
    nodes.next.click();
    assert.ok(nodes['result-story'].textContent.includes('a lot to remember'));
    assert.deepEqual(JSON.parse(values.get(SAVE_KEY)).choices, ['job', 'all-rules', null]);
    nodes.retry.click();
    assert.deepEqual(JSON.parse(values.get(SAVE_KEY)).choices, ['job', null, null]);
  });
});

test('narration is requested explicitly and stops on choices, navigation, and leaving', async () => {
  await visit('speech', { speech: true }, ({ nodes, spoken, cancelled, events }) => {
    assert.equal(spoken.length, 0);
    assert.equal(nodes['read-aloud'].hidden, false);
    nodes['read-aloud'].click();
    assert.ok(spoken[0].text.includes('Ask if Patience'));
    assert.equal(nodes['read-aloud'].textContent, 'Stop reading');
    nodes.choices.children[0].click();
    assert.equal(cancelled(), 1);
    nodes['read-aloud'].click();
    assert.ok(spoken[1].text.includes('An invitation'));
    nodes.next.click();
    assert.equal(cancelled(), 2);
    nodes['read-aloud'].click(); events.pagehide();
    assert.equal(cancelled(), 3);
    nodes.choices.children[0].click(); nodes.restart.click();
    assert.equal(nodes.choices.children.length, 2);
    assert.ok(nodes.progress.textContent.includes('Moment 1'));
  });
});

test('blocked browser storage and unavailable speech leave the story playable', async () => {
  await visit('blocked', { blocked: true }, ({ nodes }) => {
    assert.ok(nodes['save-note'].textContent.includes('for this visit'));
    assert.equal(nodes['read-aloud'].hidden, true);
    nodes.choices.children[0].click(); nodes.next.click();
    assert.ok(nodes.progress.textContent.includes('Moment 2'));
    nodes.restart.click();
    assert.equal(nodes.choices.children.length, 2);
  });
});
