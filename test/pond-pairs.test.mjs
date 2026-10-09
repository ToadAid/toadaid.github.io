import test from 'node:test';
import assert from 'node:assert/strict';
import { createRound, FRIENDS } from '../childrens-corner/pond-pairs/engine.mjs';

test('every shuffled game contains exactly two of each friend', () => {
  for (const random of [() => 0, () => 0.999999, Math.random]) {
    for (let i = 0; i < 30; i++) {
      const state = createRound(random).snapshot();
      assert.equal(state.cards.length, 6);
      for (const friend of FRIENDS) assert.equal(state.cards.filter(card => card.friend === friend.id).length, 2);
      assert.ok(state.cards.every(card => card.state === 'hidden'));
      assert.equal(state.complete, false);
    }
  }
});

test('invalid clicks and choosing the same card twice cannot form a pair', () => {
  const round = createRound(() => 0.999999);
  for (const index of [-1, 6, 1.5, NaN, '0', undefined]) assert.equal(round.choose(index), null);
  assert.equal(round.choose(0).kind, 'first');
  assert.equal(round.choose(0), null);
  assert.equal(round.snapshot().found.length, 0);
  assert.equal(round.snapshot().cards.filter(card => card.state === 'open').length, 1);
});

test('a mismatch stays visible until the player chooses to turn it back', () => {
  const round = createRound(() => 0.999999);
  round.choose(0);
  assert.equal(round.choose(2).kind, 'miss');
  for (let i = 0; i < 6; i++) assert.equal(round.choose(i), null);
  assert.equal(round.snapshot().waiting, true);
  assert.equal(round.snapshot().cards.filter(card => card.state === 'open').length, 2);
  assert.equal(round.continue(), 0);
  assert.equal(round.snapshot().waiting, false);
  assert.ok(round.snapshot().cards.every(card => card.state === 'hidden'));
  assert.equal(round.continue(), null);
  assert.equal(round.choose(2).kind, 'first');
});

test('matching all three friends wins once and matched cards cannot be reused', () => {
  const round = createRound(() => 0.999999);
  for (let i = 0; i < 6; i += 2) {
    assert.equal(round.choose(i).kind, 'first');
    assert.equal(round.choose(i + 1).kind, i === 4 ? 'complete' : 'match');
    assert.equal(round.choose(i), null);
    assert.equal(round.snapshot().waiting, false);
    assert.equal(round.continue(), null);
  }
  assert.equal(round.snapshot().complete, true);
  assert.equal(round.snapshot().found.length, 3);
  assert.ok(round.snapshot().cards.every(card => card.state === 'matched'));
  for (let i = 0; i < 6; i++) assert.equal(round.choose(i), null);
});

test('snapshots cannot mutate the round and a fresh round has no previous progress', () => {
  const round = createRound(() => 0.999999);
  const state = round.snapshot();
  state.cards[0].friend = 'other';
  state.cards[0].state = 'matched';
  state.found.push('toby');
  assert.equal(round.snapshot().cards[0].friend, 'toby');
  assert.equal(round.snapshot().found.length, 0);
  round.choose(0); round.choose(1);
  const fresh = createRound(() => 0.999999).snapshot();
  assert.equal(fresh.found.length, 0);
  assert.ok(fresh.cards.every(card => card.state === 'hidden'));
});
