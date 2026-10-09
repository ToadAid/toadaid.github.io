import { LANDS, createExplorer, loadExplorer, saveExplorer } from './engine.mjs';
import { createNarrator } from './narrator.mjs';

const ids = ['explorer', 'land-picker', 'land-title', 'land-subtitle', 'land-image', 'pins', 'discoveries', 'progress', 'land-story', 'finished', 'finish-title', 'finish-text', 'next-land', 'save-note', 'reset', 'compatibility', 'discovery-dialog', 'dialog-friend', 'discovery-count', 'discovery-title', 'discovery-story', 'discovery-question', 'close-discovery', 'close-top', 'read-aloud', 'audio-note'];
const nodes = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

if (typeof nodes['discovery-dialog'].showModal !== 'function') {
  nodes.compatibility.hidden = false;
} else {
  start();
}

function start() {
  let storage;
  let speech;
  let Utterance;
  try { storage = globalThis.localStorage; } catch { /* Exploring remains available. */ }
  try { speech = globalThis.speechSynthesis; Utterance = globalThis.SpeechSynthesisUtterance; } catch { /* Reading together remains available. */ }
  const explorer = createExplorer(loadExplorer(storage));
  explorer.chooseLand(globalThis.location?.hash?.slice(1));
  let choices = [];
  let openedFrom = null;
  let currentSpot = null;
  const narrator = createNarrator(speech, Utterance, state => {
    nodes['read-aloud'].textContent = state === 'reading' ? 'Stop reading' : 'Read to me';
    nodes['read-aloud'].setAttribute('aria-pressed', String(state === 'reading'));
    nodes['audio-note'].textContent = state === 'error' ? 'This voice is unavailable. You can read the story together.' : '';
  });
  nodes['read-aloud'].hidden = !narrator.supported;
  const landButtons = LANDS.map(land => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'land-choice'; button.textContent = land.name;
    button.addEventListener('click', () => selectLand(land.id));
    nodes['land-picker'].append(button);
    return { id: land.id, button };
  });

  function save() {
    nodes['save-note'].textContent = saveExplorer(storage, explorer) ? 'Your discoveries are remembered in this browser. Come back whenever you like.' : 'You can keep exploring for this visit. Discoveries will start fresh next time.';
  }
  function paintFound() {
    const state = explorer.snapshot();
    choices.forEach(choice => {
      const found = state.found.includes(choice.id);
      choice.pin.dataset.found = String(found);
      choice.button.dataset.found = String(found);
      const label = `${choice.number}. ${choice.name}${found ? '. Found' : ''}. Open discovery`;
      choice.pin.setAttribute('aria-label', label);
      choice.button.setAttribute('aria-label', label);
      choice.button.querySelector('small').textContent = found ? 'Found · Read again' : 'Explore';
    });
    nodes.progress.textContent = `${state.found.length} of 5 discoveries found here · ${state.total} of 15 altogether`;
    nodes.finished.hidden = !state.complete;
    nodes['finish-title'].textContent = state.completedLands.length === LANDS.length ? 'All three lands explored!' : 'A lovely little adventure!';
    nodes['finish-text'].textContent = state.completedLands.length === LANDS.length ? 'You found fifteen little discoveries with the three friends. Revisit a favourite story, or explore a land afresh whenever you like.' : 'You met all three friends and found this land’s little wonders. Revisit any discovery, or choose another place to explore.';
    const next = LANDS[(LANDS.findIndex(land => land.id === state.land.id) + 1) % LANDS.length];
    nodes['next-land'].textContent = `Visit the ${next.name} →`;
    save();
  }
  function openDiscovery(id, button) {
    const result = explorer.discover(id);
    if (!result) return;
    currentSpot = result.spot;
    openedFrom = button;
    narrator.stop();
    paintFound();
    nodes['dialog-friend'].setAttribute('href', `../pond-pairs/friends.svg#${currentSpot.friend}`);
    nodes['discovery-count'].textContent = `${explorer.snapshot().land.name} · ${result.fresh ? 'A new discovery' : 'A favourite to revisit'}`;
    nodes['discovery-title'].textContent = currentSpot.name;
    nodes['discovery-story'].textContent = currentSpot.story;
    nodes['discovery-question'].textContent = currentSpot.question;
    if (!nodes['discovery-dialog'].open) nodes['discovery-dialog'].showModal();
    nodes['discovery-title'].focus();
  }
  function renderLand() {
    const state = explorer.snapshot();
    const land = state.land;
    nodes['land-title'].textContent = land.name;
    nodes['land-subtitle'].textContent = land.title;
    nodes['land-image'].setAttribute('src', land.image);
    nodes['land-image'].setAttribute('alt', land.alt);
    nodes['land-story'].setAttribute('href', `../lore-lands.html#${land.storyAnchor}`);
    landButtons.forEach(item => item.button.setAttribute('aria-pressed', String(item.id === land.id)));
    nodes.pins.replaceChildren(); nodes.discoveries.replaceChildren();
    choices = land.spots.map((spot, index) => {
      const number = index + 1;
      const pin = document.createElement('button');
      pin.type = 'button'; pin.className = 'picture-pin';
      pin.innerHTML = `<span class="pin-circle" aria-hidden="true">${number}<svg class="pin-tick" viewBox="0 0 14 14" focusable="false"><path d="M3 7L6 10L11 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
      for (const [name, value] of [['--x', spot.point[0]], ['--y', spot.point[1]], ['--phone-x', spot.phone[0]], ['--phone-y', spot.phone[1]]]) pin.style.setProperty(name, `${value}%`);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'discovery-choice';
      button.innerHTML = `<span class="number" aria-hidden="true">${number}</span><span><strong></strong><small>Explore</small></span>`;
      button.querySelector('strong').textContent = spot.name;
      for (const control of [pin, button]) {
        control.setAttribute('aria-haspopup', 'dialog');
        control.setAttribute('aria-controls', 'discovery-dialog');
        control.addEventListener('click', () => openDiscovery(spot.id, control));
      }
      nodes.pins.append(pin); nodes.discoveries.append(button);
      return { id: spot.id, name: spot.name, number, pin, button };
    });
    paintFound();
  }
  function selectLand(id, focus = false) {
    if (!explorer.chooseLand(id)) return;
    if (nodes['discovery-dialog'].open) nodes['discovery-dialog'].close();
    narrator.stop();
    renderLand();
    try { globalThis.history?.replaceState(null, '', `#${id}`); } catch { /* Links still work without history access. */ }
    if (focus) landButtons.find(item => item.id === id).button.focus();
  }
  nodes['close-discovery'].addEventListener('click', () => nodes['discovery-dialog'].close());
  nodes['close-top'].addEventListener('click', () => nodes['discovery-dialog'].close());
  nodes['discovery-dialog'].addEventListener('close', () => { narrator.stop(); openedFrom?.focus(); });
  nodes['discovery-dialog'].addEventListener('cancel', () => narrator.stop());
  nodes['read-aloud'].addEventListener('click', () => {
    if (!currentSpot || !nodes['discovery-dialog'].open) return;
    if (narrator.isReading()) narrator.stop();
    else narrator.read(`${currentSpot.name}. ${currentSpot.story} Look and talk together. ${currentSpot.question}`);
  });
  nodes['next-land'].addEventListener('click', () => {
    const index = LANDS.findIndex(land => land.id === explorer.snapshot().land.id);
    selectLand(LANDS[(index + 1) % LANDS.length].id, true);
  });
  nodes.reset.addEventListener('click', () => { explorer.resetLand(); paintFound(); choices[0].pin.focus(); });
  globalThis.addEventListener('pagehide', () => narrator.stop());
  globalThis.addEventListener('hashchange', () => selectLand(globalThis.location.hash.slice(1)));
  document.addEventListener('visibilitychange', () => { if (document.hidden) narrator.stop(); });
  renderLand();
  nodes.explorer.hidden = false;
}
