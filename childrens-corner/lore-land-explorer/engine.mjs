const spot = (id, name, friend, point, phone, story, question) => Object.freeze({ id, name, friend, point: Object.freeze(point), phone: Object.freeze(phone), story, question });

export const LANDS = Object.freeze([
  Object.freeze({
    id: 'lantern-garden', name: 'Lantern Garden', title: 'A little light. Three good friends.',
    image: '../art/lore-land-lantern-garden.webp', storyAnchor: 'lantern-garden',
    alt: 'Blue Toby, Taboshi, and Patience on a bridge beneath glowing lanterns and a purple blossom tree, with lotus flowers and floating islands beyond.',
    spots: Object.freeze([
      spot('toby', 'Blue Toby', 'toby', [53, 76], [53, 84], 'Blue Toby pauses on the little bridge. “Will you walk beside me?” he asks. His friends smile. There is room for all three in the lantern’s warm light.', 'Who helps you feel brave when you try something new?'),
      spot('taboshi', 'Taboshi', 'taboshi', [40, 68], [35, 43], 'Taboshi looks up at the blossom tree. A petal drifts toward the stream. “Even a little flower has something to show us,” says the green leaf.', 'Can you find a pink flower and a green leaf in the picture?'),
      spot('patience', 'Patience', 'patience', [70, 73], [77, 62], 'Patience stays beside Toby. “We can take our time,” says the red triangle. The bridge is a lovely place to pause and enjoy the evening together.', 'What could you say to a friend who wants to go slowly?'),
      spot('lantern', 'Golden lantern', 'toby', [68, 27], [68, 23], 'A golden lantern glows beneath the tree. Toby notices its little flower shape. “I thought there was only light,” he says. “Now I see a pattern too!”', 'Look at the lantern. What shape or colour catches your eye?'),
      spot('lotus', 'Lotus flower', 'taboshi', [17, 87], [14, 86], 'A pink lotus rests above the water. Taboshi points out its many petals. The friends look closely, then leave the flower right where it belongs.', 'What can you enjoy in nature without picking it?')
    ])
  }),
  Object.freeze({
    id: 'leafy-path', name: 'Leafy Path', title: 'One kind step at a time.',
    image: '../art/lore-land-kind-step.webp', storyAnchor: 'kind-step',
    alt: 'Blue Toby leads Taboshi and Patience along round stepping stones on a green floating forest island, with a tiny sprout and a blue crystal below.',
    spots: Object.freeze([
      spot('toby', 'Blue Toby', 'toby', [42, 64], [35, 68], 'Toby steps onto a round stone, then looks back. Taboshi and Patience have found something small beside the path. Toby comes back to share their discovery.', 'How can you help a friend feel included?'),
      spot('taboshi', 'Taboshi', 'taboshi', [54, 52], [52, 18], 'Taboshi rustles happily in the leafy forest. “There are so many shades of green,” says the little leaf. Toby looks again and notices the trees, grass, and sprout.', 'How many different green things can you spot?'),
      spot('patience', 'Patience', 'patience', [66, 37], [76, 42], 'Patience waits on the path while the friends look at the sprout. Nobody needs to hurry. When everyone is ready, they can take the next little step together.', 'What is something you like taking your time with?'),
      spot('sprout', 'Tiny sprout', 'taboshi', [72, 62], [83, 80], 'Two small leaves reach up beside the path. “Hello, little sprout,” whispers Toby. Taboshi helps him notice it without stepping on its little patch of grass.', 'Hold up two fingers for the sprout’s two leaves.'),
      spot('crystal', 'Blue crystal', 'patience', [46, 85], [55, 84], 'A blue crystal shines in a nook beneath the floating island. “What a lovely colour,” says Patience. The friends admire it from their path above.', 'What else in the picture is blue?')
    ])
  }),
  Object.freeze({
    id: 'little-pond', name: 'Little Pond', title: 'The same pond. New things to notice.',
    image: '../art/lore-land-three-stumps.webp', storyAnchor: 'three-stumps',
    alt: 'Blue Toby, Taboshi, and Patience on a grassy bank beside a blue pond with three wooden stumps, little fish, lotus flowers, and red bridges.',
    spots: Object.freeze([
      spot('toby', 'Blue Toby', 'toby', [32, 80], [28, 84], 'Blue Toby settles on the grassy bank with his friends. “Let’s tell each other one thing we see,” he says. A little afternoon becomes a whole world of discoveries.', 'What would you show Toby first?'),
      spot('taboshi', 'Taboshi', 'taboshi', [19, 72], [16, 48], 'Taboshi notices the pink flowers and green lily pads. A little breeze moves through the garden. The friends stay on the bank and enjoy the pond together.', 'Can you find something pink and something green?'),
      spot('patience', 'Patience', 'patience', [44, 75], [50, 47], 'Patience watches a ripple spread over the water. A little circle grows wider, then fades. “Sometimes looking quietly helps us notice more,” says the red triangle.', 'Trace a little circle in the air. Can you find a ripple?'),
      spot('stumps', 'Three stumps', 'toby', [62, 52], [83, 47], '“One, two, three!” says Toby. Three little wooden stumps stand in the pond. The friends count them from the grassy bank, taking turns pointing to each one.', 'Point to each stump and count to three together.'),
      spot('fish', 'Little fish', 'patience', [73, 71], [70, 85], 'A bright little fish swims past a lily pad. Patience shows Toby where to look. “We noticed different things,” says Toby. “I’m glad you shared yours.”', 'What did your reading friend notice that you had not seen?')
    ])
  })
]);

export const SAVE_KEY = 'toadaid-lore-land-explorer-v1';
const validLand = id => LANDS.some(land => land.id === id);

function valid(record) {
  if (!record || record.version !== 1 || !validLand(record.land) || !record.found || typeof record.found !== 'object') return false;
  return LANDS.every(land => {
    const found = record.found[land.id];
    return Array.isArray(found) && found.length <= land.spots.length && new Set(found).size === found.length && found.every(id => land.spots.some(spot => spot.id === id));
  });
}

export function createExplorer(record) {
  let active = valid(record) ? record.land : LANDS[0].id;
  const found = Object.fromEntries(LANDS.map(land => [land.id, new Set(valid(record) ? record.found[land.id] : [])]));
  return {
    snapshot() {
      const land = LANDS.find(item => item.id === active);
      return { land, found: [...found[active]], complete: found[active].size === land.spots.length, total: LANDS.reduce((sum, item) => sum + found[item.id].size, 0), completedLands: LANDS.filter(item => found[item.id].size === item.spots.length).map(item => item.id) };
    },
    chooseLand(id) { if (!validLand(id)) return false; active = id; return true; },
    discover(id) {
      const land = LANDS.find(item => item.id === active);
      const spot = land.spots.find(item => item.id === id);
      if (!spot) return null;
      const fresh = !found[active].has(id);
      found[active].add(id);
      return { spot, fresh };
    },
    resetLand() { found[active].clear(); },
    serialize() { return { version: 1, land: active, found: Object.fromEntries(LANDS.map(land => [land.id, [...found[land.id]]])) }; }
  };
}

export function loadExplorer(storage) {
  try { const record = JSON.parse(storage.getItem(SAVE_KEY)); return valid(record) ? record : null; }
  catch { return null; }
}
export function saveExplorer(storage, explorer) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(explorer.serialize())); return true; }
  catch { return false; }
}
