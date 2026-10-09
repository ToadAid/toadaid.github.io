import test from 'node:test';
import assert from 'node:assert/strict';
import { createGarden, loadGarden, saveGarden, SAVE_KEY, DAYS } from '../childrens-corner/little-garden/engine.mjs';

test('a seed can be chosen before planting and cannot be swapped mid-growth', () => {
  const garden = createGarden();
  assert.equal(garden.snapshot().action, 'plant');
  assert.equal(garden.selectSeed('unknown'), false);
  assert.equal(garden.selectSeed('gold'), true);
  assert.equal(garden.act('plant'), true);
  assert.equal(garden.snapshot().seed, 'gold');
  assert.equal(garden.selectSeed('pink'), false);
});

test('care requires checking the soil, with one drink only on dry days', () => {
  const garden = createGarden();
  garden.act('plant');
  assert.equal(garden.act('water'), false);
  assert.equal(garden.act('next'), false);
  assert.equal(garden.act('inspect'), true);
  assert.equal(garden.act('next'), false);
  assert.equal(garden.act('water'), true);
  for (let i = 0; i < 20; i++) assert.equal(garden.act('water'), false);
  assert.equal(garden.snapshot().day, 1);
  garden.act('next');
  garden.act('inspect');
  assert.equal(garden.act('water'), false);
  assert.equal(garden.snapshot().action, 'next');
});

test('all six story days finish without exceeding the final stage', () => {
  for (const seed of ['pink', 'gold']) {
    const garden = createGarden();
    garden.selectSeed(seed); garden.act('plant');
    for (let day = 1; day <= 6; day++) {
      assert.equal(garden.snapshot().day, day);
      assert.equal(garden.snapshot().checked, false);
      assert.equal(garden.snapshot().watered, false);
      assert.equal(garden.act('inspect'), true);
      if (DAYS[day].dry) assert.equal(garden.act('water'), true);
      if (day < 6) assert.equal(garden.act('next'), true);
    }
    assert.equal(garden.snapshot().complete, true);
    for (const action of ['next', 'plant', 'water', 'inspect', 'finished', 'unknown']) assert.equal(garden.act(action), false);
    assert.equal(garden.snapshot().day, 6);
  }
});

test('return visits restore every care step without advancing the story', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let garden = createGarden();
  garden.selectSeed('gold');
  for (let i = 0; i < 17; i++) {
    assert.equal(saveGarden(storage, garden), true);
    const before = garden.snapshot();
    garden = createGarden(loadGarden(storage));
    assert.deepEqual(garden.snapshot(), before);
    if (!before.complete) garden.act(before.action);
  }
  assert.ok(values.has(SAVE_KEY));
  assert.deepEqual(Object.keys(garden.serialize()).sort(), ['checked', 'day', 'seed', 'version', 'watered']);
});

test('corrupt, unsupported, and impossible saves return a fresh garden', () => {
  const good = { version: 1, seed: 'pink', day: 1, checked: false, watered: false };
  const records = [null, {}, { ...good, version: 2 }, { ...good, seed: 'unknown' }, { ...good, day: -1 }, { ...good, day: 7 }, { ...good, day: 1.5 }, { ...good, checked: 'yes' }, { ...good, watered: true }, { ...good, day: 0, checked: true }, { ...good, day: 2, checked: true, watered: true }];
  for (const record of records) {
    assert.equal(createGarden(record).snapshot().day, 0);
    assert.equal(loadGarden({ getItem: () => JSON.stringify(record) }), null);
  }
  assert.equal(loadGarden({ getItem: () => '{broken' }), null);
});

test('blocked storage leaves the garden playable and snapshots cannot change it', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  assert.equal(loadGarden(blocked), null);
  const garden = createGarden();
  assert.equal(saveGarden(blocked, garden), false);
  assert.equal(saveGarden(undefined, garden), false);
  assert.equal(garden.act('plant'), true);
  const copy = garden.serialize(); copy.day = 6;
  const view = garden.snapshot(); view.checked = true;
  assert.equal(garden.snapshot().day, 1);
  assert.equal(garden.snapshot().checked, false);
});
