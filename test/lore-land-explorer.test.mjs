import test from 'node:test';
import assert from 'node:assert/strict';
import { LANDS, SAVE_KEY, createExplorer, loadExplorer, saveExplorer } from '../childrens-corner/lore-land-explorer/engine.mjs';

test('discoveries can be opened in any order and revisiting never inflates progress', () => {
  const explorer = createExplorer();
  assert.equal(explorer.discover('missing'), null);
  for (const spot of [...LANDS[0].spots].reverse()) {
    assert.equal(explorer.discover(spot.id).fresh, true);
    for (let i = 0; i < 10; i++) assert.equal(explorer.discover(spot.id).fresh, false);
  }
  assert.equal(explorer.snapshot().found.length, 5);
  assert.equal(explorer.snapshot().complete, true);
  assert.equal(explorer.snapshot().total, 5);
});

test('switching lands preserves separate discoveries and all fifteen can be completed', () => {
  const explorer = createExplorer();
  assert.equal(explorer.chooseLand('unknown'), false);
  for (const land of LANDS) {
    assert.equal(explorer.chooseLand(land.id), true);
    assert.equal(explorer.snapshot().found.length, 0);
    for (const spot of land.spots) explorer.discover(spot.id);
  }
  for (const land of LANDS) {
    explorer.chooseLand(land.id);
    assert.equal(explorer.snapshot().found.length, 5);
  }
  assert.equal(explorer.snapshot().total, 15);
  assert.equal(explorer.snapshot().completedLands.length, 3);
});

test('exploring a land afresh clears only that land', () => {
  const explorer = createExplorer();
  for (const land of LANDS) { explorer.chooseLand(land.id); explorer.discover('toby'); }
  explorer.resetLand();
  assert.equal(explorer.snapshot().found.length, 0);
  assert.equal(explorer.snapshot().total, 2);
  explorer.chooseLand(LANDS[0].id);
  assert.deepEqual(explorer.snapshot().found, ['toby']);
});

test('return visits restore the active land and discoveries without sharing mutable data', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const explorer = createExplorer();
  explorer.discover('toby'); explorer.chooseLand('leafy-path'); explorer.discover('sprout');
  assert.equal(saveExplorer(storage, explorer), true);
  const copy = createExplorer(loadExplorer(storage));
  assert.equal(copy.snapshot().land.id, 'leafy-path');
  assert.deepEqual(copy.snapshot().found, ['sprout']);
  assert.equal(copy.snapshot().total, 2);
  const record = copy.serialize(); record.found['leafy-path'].push('toby');
  const view = copy.snapshot(); view.found.push('patience');
  assert.equal(copy.snapshot().found.length, 1);
  assert.ok(values.has(SAVE_KEY));
});

test('corrupt and unsupported saved progress starts a fresh explorer', () => {
  const valid = createExplorer().serialize();
  for (const record of [null, {}, { ...valid, version: 2 }, { ...valid, land: 'missing' }, { ...valid, found: {} }, { ...valid, found: { ...valid.found, 'lantern-garden': ['toby', 'toby'] } }, { ...valid, found: { ...valid.found, 'leafy-path': ['unknown'] } }]) {
    assert.equal(loadExplorer({ getItem: () => JSON.stringify(record) }), null);
    assert.equal(createExplorer(record).snapshot().total, 0);
  }
  assert.equal(loadExplorer({ getItem: () => '{broken' }), null);
});

test('blocked saving does not prevent discovery', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  assert.equal(loadExplorer(storage), null);
  const explorer = createExplorer();
  assert.equal(saveExplorer(storage, explorer), false);
  assert.equal(explorer.discover('lantern').fresh, true);
  assert.equal(saveExplorer(undefined, explorer), false);
});

test('48px picture targets remain inside the scene and at least 8px apart from 320px upward', () => {
  for (const viewport of [320, 375, 600, 601, 768, 1024, 1440]) {
    const width = Math.min(viewport, 1160) - (viewport <= 600 ? 32 : 48) - 4;
    const height = width * 941 / 1672;
    const clamp = (number, size) => Math.max(26, Math.min(number, size - 26));
    for (const land of LANDS) {
      const points = land.spots.map(spot => {
        const point = viewport <= 600 ? spot.phone : spot.point;
        return [clamp(width * point[0] / 100, width), clamp(height * point[1] / 100, height)];
      });
      for (const [x, y] of points) {
        assert.ok(x - 24 >= 0 && x + 24 <= width);
        assert.ok(y - 24 >= 0 && y + 24 <= height);
      }
      for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
        const dx = Math.abs(points[i][0] - points[j][0]);
        const dy = Math.abs(points[i][1] - points[j][1]);
        assert.ok(dx >= 56 || dy >= 56, `${land.id} at ${viewport}px: ${land.spots[i].id}/${land.spots[j].id} overlap or have insufficient spacing`);
      }
    }
  }
});
