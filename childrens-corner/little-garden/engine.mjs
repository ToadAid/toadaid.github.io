export const SEEDS = Object.freeze([
  Object.freeze({ id: 'pink', name: 'Pink blossom' }),
  Object.freeze({ id: 'gold', name: 'Golden flower' })
]);

export const DAYS = Object.freeze([
  Object.freeze({ title: 'A little beginning', story: 'Blue Toby has a little pot and two kinds of pretend seeds. Which flower would you like to grow?', discovery: 'Look at the friends. Can you find a leaf shape, a triangle, and a round blue belly?' }),
  Object.freeze({ title: 'A home for the seed', dry: true, story: 'Toby tucks the seed into its little pot. “Let’s learn what it needs,” says Taboshi.', discovery: 'Find the butterfly above the garden. How many wings can you see?' }),
  Object.freeze({ title: 'Quiet roots', dry: false, story: 'The pot still looks quiet. “Little roots are growing where we cannot see them,” says Patience.', discovery: 'Look at the clouds. What would you imagine if you were watching the sky with Toby?' }),
  Object.freeze({ title: 'A tiny green hello', dry: true, story: 'A little shoot peeks through the soil! Toby calls his friends over gently to look.', discovery: 'Find the tiny shoot. Is it taller or shorter than the pot?' }),
  Object.freeze({ title: 'Two little leaves', dry: false, story: 'The little plant opens two green leaves. Taboshi smiles. “There is something new to notice.”', discovery: 'Count the plant’s leaves: one, two. Can you find another green leaf in the picture?' }),
  Object.freeze({ title: 'A waiting bud', dry: true, story: 'A small bud rests at the top of the stem. “We can enjoy today while we wait,” says Patience.', discovery: 'Find the lily pad in the pond. What colours do you see around it?' }),
  Object.freeze({ title: 'A flower to share', dry: false, story: 'The bud has opened into a flower. “Come and see!” says Toby. The three friends gather around its little pot.', discovery: 'Count the flower’s petals. Then tell someone one thing you enjoyed in the garden.' })
]);

export const SAVE_KEY = 'toadaid-little-garden-v1';

function valid(record) {
  if (!record || record.version !== 1 || !SEEDS.some(seed => seed.id === record.seed)) return false;
  if (!Number.isInteger(record.day) || record.day < 0 || record.day >= DAYS.length) return false;
  if (typeof record.checked !== 'boolean' || typeof record.watered !== 'boolean') return false;
  if (record.day === 0 && (record.checked || record.watered)) return false;
  if (record.watered && (!record.checked || !DAYS[record.day].dry)) return false;
  return true;
}

export function createGarden(record) {
  let state = valid(record) ? { version: 1, seed: record.seed, day: record.day, checked: record.checked, watered: record.watered } : { version: 1, seed: 'pink', day: 0, checked: false, watered: false };
  return {
    snapshot() {
      const day = DAYS[state.day];
      const action = state.day === 0 ? 'plant' : !state.checked ? 'inspect' : day.dry && !state.watered ? 'water' : state.day === 6 ? 'finished' : 'next';
      return { ...state, action, complete: action === 'finished' };
    },
    selectSeed(seed) {
      if (state.day !== 0 || !SEEDS.some(item => item.id === seed)) return false;
      state.seed = seed;
      return true;
    },
    act(action) {
      if (action !== this.snapshot().action || action === 'finished') return false;
      if (action === 'plant') state.day = 1;
      if (action === 'inspect') state.checked = true;
      if (action === 'water') state.watered = true;
      if (action === 'next') state = { ...state, day: state.day + 1, checked: false, watered: false };
      return true;
    },
    serialize() { return { ...state }; }
  };
}

export function loadGarden(storage) {
  try {
    const record = JSON.parse(storage.getItem(SAVE_KEY));
    return valid(record) ? record : null;
  } catch { return null; }
}

export function saveGarden(storage, garden) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(garden.serialize())); return true; }
  catch { return false; }
}
