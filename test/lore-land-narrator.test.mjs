import test from 'node:test';
import assert from 'node:assert/strict';
import { createNarrator } from '../childrens-corner/lore-land-explorer/narrator.mjs';

class Utterance { constructor(text) { this.text = text; } }
function setup() {
  const utterances = []; const states = []; let cancelled = 0;
  const local = { lang: 'en-GB', localService: true };
  const api = { speak: utterance => utterances.push(utterance), cancel: () => cancelled++, getVoices: () => [{ lang: 'fr-FR', localService: true }, { lang: 'en-US', localService: false }, local] };
  return { narrator: createNarrator(api, Utterance, state => states.push(state)), api, utterances, states, local, cancelled: () => cancelled };
}

test('narration stays optional when speech APIs are unavailable', () => {
  const narrator = createNarrator(undefined, undefined);
  assert.equal(narrator.supported, false);
  assert.equal(narrator.read('A story'), false);
  narrator.stop();
  assert.equal(narrator.isReading(), false);
});
test('narration starts on request, prefers an English local voice, and finishes', () => {
  const env = setup();
  assert.equal(env.utterances.length, 0);
  assert.equal(env.narrator.read('Hello, little explorer'), true);
  assert.equal(env.narrator.isReading(), true);
  assert.equal(env.utterances[0].voice, env.local);
  assert.equal(env.utterances[0].text, 'Hello, little explorer');
  env.utterances[0].onend();
  assert.equal(env.narrator.isReading(), false);
  assert.equal(env.states.at(-1), 'idle');
});
test('stopping and replacement cancel speech without stale callbacks changing a new story', () => {
  const env = setup();
  env.narrator.read('First'); env.narrator.read('Second');
  assert.equal(env.cancelled(), 1);
  env.utterances[0].onerror();
  assert.equal(env.narrator.isReading(), true);
  assert.equal(env.states.at(-1), 'reading');
  env.narrator.stop();
  assert.equal(env.cancelled(), 2);
  env.utterances[1].onend();
  assert.equal(env.narrator.isReading(), false);
});
test('speech failures leave reading inactive with an error state', () => {
  const env = setup();
  env.narrator.read('Hello'); env.utterances[0].onerror();
  assert.equal(env.narrator.isReading(), false);
  assert.equal(env.states.at(-1), 'error');
  env.api.speak = () => { throw new Error('voice unavailable'); };
  assert.equal(env.narrator.read('Try again'), false);
  assert.equal(env.states.at(-1), 'error');
});
