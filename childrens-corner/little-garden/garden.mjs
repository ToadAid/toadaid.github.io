import { createGarden, loadGarden, saveGarden, SEEDS, DAYS } from './engine.mjs';

const ids = ['garden', 'day-count', 'day-title', 'story', 'seed-choices', 'message', 'primary', 'look', 'discovery', 'discovery-text', 'finished', 'save-note', 'reset', 'scene-description', 'soil', 'shoot', 'leaves', 'bud', 'bud-colour', 'flower', 'bloom', 'drink'];
const elements = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const seeds = SEEDS.map(seed => ({ ...seed, button: document.getElementById(seed.id) }));
let storage;
try { storage = globalThis.localStorage; } catch { /* Play remains available without saving. */ }
const restored = loadGarden(storage);
let garden = createGarden(restored);

function guidance(state) {
  if (state.action === 'plant') return 'Choose a flower, then give your seed a home.';
  if (state.action === 'inspect') return 'Taboshi says: Let’s check the soil before we give it water.';
  if (state.action === 'water') return 'Taboshi says: The soil feels dry. A gentle drink will help our pretend plant.';
  if (state.action === 'finished') return 'Blue Toby says: Look what we cared for together! There is a little flower to share.';
  return state.watered ? 'Patience says: That is enough water for this story day. Look around, or visit the next day when you are ready.' : 'Taboshi says: The soil is still damp. Let’s leave it alone. Enjoy a discovery, or visit the next story day.';
}

function render(welcome = false) {
  const state = garden.snapshot();
  const day = DAYS[state.day];
  const colour = state.seed === 'pink' ? '#f5b8ae' : '#f3c861';
  const flower = SEEDS.find(seed => seed.id === state.seed).name.toLowerCase();
  elements['day-count'].textContent = state.day ? `Story day ${state.day} of 6` : 'Choose your seed';
  elements['day-title'].textContent = day.title;
  elements.story.textContent = day.story;
  elements['seed-choices'].hidden = state.day !== 0;
  seeds.forEach(seed => seed.button.setAttribute('aria-pressed', String(seed.id === state.seed)));
  elements.message.textContent = `${welcome && state.day > 0 ? 'Welcome back! Your garden is right where you left it. ' : ''}${guidance(state)}`;
  elements.primary.textContent = { plant: 'Plant my seed', inspect: 'Check the soil', water: 'Give a gentle drink', next: 'Visit the next story day', finished: 'Plant another seed' }[state.action];
  elements.reset.hidden = state.day === 0 || state.complete;
  elements.finished.hidden = !state.complete;
  elements.shoot.toggleAttribute('hidden', state.day !== 3);
  elements.leaves.toggleAttribute('hidden', state.day < 4);
  elements.bud.toggleAttribute('hidden', state.day !== 5);
  elements.flower.toggleAttribute('hidden', state.day !== 6);
  elements.drink.toggleAttribute('hidden', !state.watered);
  elements['bud-colour'].setAttribute('fill', colour);
  elements.bloom.setAttribute('color', colour);
  elements.soil.setAttribute('fill', state.day > 0 && (!day.dry || state.watered) ? '#624b3b' : '#8b6651');
  const plant = ['an empty flowerpot', 'a seed resting beneath the soil', 'a quiet pot with roots growing out of sight', 'a tiny green shoot', 'a growing stem with two green leaves', `two leaves and a closed ${flower} bud`, `a five-petalled ${flower}`][state.day];
  elements['scene-description'].textContent = `Blue Toby, green leaf Taboshi, and red triangle Patience beside ${plant}. A butterfly, clouds, and a lily pond are nearby.`;
  const saved = saveGarden(storage, garden);
  elements['save-note'].textContent = saved ? 'Your garden is remembered in this browser. Come back whenever you like.' : 'Your garden stays for this visit. You can keep playing at your own pace.';
}

function reset() {
  garden = createGarden();
  elements.discovery.hidden = true;
  render();
  seeds[0].button.focus();
}

seeds.forEach(seed => seed.button.addEventListener('click', () => {
  if (!garden.selectSeed(seed.id)) return;
  render();
  elements.message.textContent = `${seed.name} chosen. Toby is ready to plant with you.`;
}));
elements.primary.addEventListener('click', () => {
  const state = garden.snapshot();
  if (state.complete) { reset(); return; }
  if (!garden.act(state.action)) return;
  if (state.action === 'plant' || state.action === 'next') elements.discovery.hidden = true;
  render();
});
elements.look.addEventListener('click', () => {
  elements.discovery.hidden = false;
  elements['discovery-text'].textContent = DAYS[garden.snapshot().day].discovery;
});
elements.reset.addEventListener('click', reset);
render(Boolean(restored));
elements.garden.hidden = false;
