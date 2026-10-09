export const FRIENDS = Object.freeze([
  Object.freeze({ id: 'toby', name: 'Blue Toby' }),
  Object.freeze({ id: 'taboshi', name: 'Taboshi' }),
  Object.freeze({ id: 'patience', name: 'Patience' })
]);

export function createRound(random = Math.random) {
  const cards = FRIENDS.flatMap(friend => [friend.id, friend.id]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  const matched = new Set();
  let open = [];
  return {
    snapshot() {
      return {
        cards: cards.map((friend, i) => ({ friend, state: matched.has(friend) ? 'matched' : open.includes(i) ? 'open' : 'hidden' })),
        found: FRIENDS.filter(friend => matched.has(friend.id)).map(friend => friend.id),
        waiting: open.length === 2,
        complete: matched.size === FRIENDS.length
      };
    },
    choose(index) {
      if (!Number.isInteger(index) || index < 0 || index >= cards.length || open.length === 2 || open.includes(index) || matched.has(cards[index])) return null;
      open.push(index);
      const name = FRIENDS.find(friend => friend.id === cards[index]).name;
      if (open.length === 1) return { kind: 'first', name };
      if (cards[open[0]] !== cards[open[1]]) return { kind: 'miss' };
      matched.add(cards[index]);
      open = [];
      return { kind: matched.size === FRIENDS.length ? 'complete' : 'match', name };
    },
    continue() {
      if (open.length !== 2) return null;
      const focus = open[0];
      open = [];
      return focus;
    }
  };
}
