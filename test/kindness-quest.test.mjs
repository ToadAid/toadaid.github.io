import test from 'node:test';
import assert from 'node:assert/strict';
import { MOMENTS, SAVE_KEY, createQuest, loadQuest, saveQuest } from '../childrens-corner/kindness-quest/engine.mjs';

test('all eight choice paths reach their appropriate welcome ending', () => {
  for (let path = 0; path < 8; path++) {
    const quest = createQuest();
    for (let step = 0; step < 3; step++) {
      const choice = MOMENTS[step].choices[(path >> step) & 1];
      assert.equal(quest.snapshot().phase, 'choice');
      assert.equal(quest.choose(choice.id), true);
      assert.equal(quest.snapshot().selected.id, choice.id);
      assert.equal(quest.snapshot().phase, 'result');
      assert.equal(quest.next(), true);
    }
    const ending = quest.snapshot();
    assert.equal(ending.complete, true);
    assert.equal(ending.phase, 'ending');
    assert.ok(ending.ending.story.includes((path & 4) ? 'watching' : 'places it gently'));
  }
});

test('unknown, repeated, and out-of-order actions cannot skip story moments', () => {
  const quest = createQuest();
  assert.equal(quest.next(), false);
  assert.equal(quest.back(), false);
  assert.equal(quest.retry(), false);
  assert.equal(quest.choose('small-step'), false);
  assert.equal(quest.choose('missing'), false);
  quest.choose('ask');
  for (let i = 0; i < 20; i++) assert.equal(quest.choose('job'), false);
  assert.equal(quest.snapshot().selected.id, 'ask');
  quest.next();
  assert.equal(quest.next(), false);
});

test('previous moments preserve the chosen path until retry clears only that moment and later choices', () => {
  const quest = createQuest();
  quest.choose('ask'); quest.next(); quest.choose('small-step'); quest.next(); quest.choose('offer-turn'); quest.next();
  assert.equal(quest.back(), true);
  assert.deepEqual(quest.snapshot().choices, ['ask', 'small-step', 'offer-turn']);
  assert.equal(quest.snapshot().phase, 'result');
  quest.back(); quest.retry();
  assert.deepEqual(quest.snapshot().choices, ['ask', null, null]);
  assert.equal(quest.snapshot().phase, 'choice');
  quest.choose('all-rules'); quest.next();
  assert.equal(quest.snapshot().phase, 'choice');
  quest.choose('watch-beside'); quest.next();
  assert.ok(quest.snapshot().ending.story.includes('watching'));
});

test('completion remains bounded and a fresh quest has no previous choices', () => {
  const quest = createQuest();
  for (const moment of MOMENTS) { quest.choose(moment.choices[0].id); quest.next(); }
  assert.equal(quest.next(), false);
  assert.equal(quest.choose('ask'), false);
  assert.equal(quest.retry(), false);
  assert.equal(quest.snapshot().step, 3);
  assert.deepEqual(createQuest().snapshot().choices, [null, null, null]);
});

test('saved visits restore choices, results, backwards views, and endings', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let quest = createQuest();
  for (let i = 0; i < 7; i++) {
    assert.equal(saveQuest(storage, quest), true);
    const before = quest.snapshot();
    quest = createQuest(loadQuest(storage));
    assert.deepEqual(quest.snapshot(), before);
    if (before.phase === 'choice') quest.choose(before.moment.choices[0].id);
    else if (before.phase === 'result') quest.next();
  }
  assert.equal(quest.snapshot().complete, true);
  quest.back(); quest.back();
  saveQuest(storage, quest);
  assert.deepEqual(createQuest(loadQuest(storage)).snapshot(), quest.snapshot());
  assert.ok(values.has(SAVE_KEY));
});

test('impossible, corrupt, and unsupported saves start a fresh story', () => {
  const valid = { version: 1, step: 0, choices: [null, null, null] };
  for (const record of [null, {}, { ...valid, version: 2 }, { ...valid, step: -1 }, { ...valid, step: 4 }, { ...valid, step: 0.5 }, { ...valid, choices: [] }, { ...valid, step: 1 }, { ...valid, choices: ['missing', null, null] }, { ...valid, choices: [null, 'small-step', null] }, { ...valid, step: 3, choices: ['ask', 'small-step', null] }]) {
    assert.equal(loadQuest({ getItem: () => JSON.stringify(record) }), null);
    assert.equal(createQuest(record).snapshot().step, 0);
  }
  assert.equal(loadQuest({ getItem: () => '{broken' }), null);
});

test('blocked storage and copied snapshots cannot change a playable quest', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  assert.equal(loadQuest(storage), null);
  const quest = createQuest();
  assert.equal(saveQuest(storage, quest), false);
  const copy = quest.snapshot(); copy.choices[0] = 'ask';
  const record = quest.serialize(); record.step = 3;
  assert.equal(quest.snapshot().phase, 'choice');
  assert.equal(quest.choose('job'), true);
});
