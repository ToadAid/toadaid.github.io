import { createQuest, loadQuest, saveQuest } from './engine.mjs';
import { createNarrator } from '../lore-land-explorer/narrator.mjs';

const ids = ['quest', 'progress', 'moment-title', 'story', 'question', 'choices', 'result', 'result-title', 'result-story', 'ending', 'ending-story', 'reflection', 'reflection-text', 'next', 'retry', 'play-again', 'read-aloud', 'audio-note', 'back', 'restart', 'save-note', 'patience', 'shared-petal', 'scene-description', 'scene-caption'];
const nodes = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
let storage;
let speech;
let Utterance;
try { storage = globalThis.localStorage; } catch { /* The story remains playable. */ }
try { speech = globalThis.speechSynthesis; Utterance = globalThis.SpeechSynthesisUtterance; } catch { /* Reading together remains available. */ }
let quest = createQuest(loadQuest(storage));
const narrator = createNarrator(speech, Utterance, state => {
  nodes['read-aloud'].textContent = state === 'reading' ? 'Stop reading' : 'Read to me';
  nodes['read-aloud'].setAttribute('aria-pressed', String(state === 'reading'));
  nodes['audio-note'].textContent = state === 'error' ? 'This voice is unavailable. You can read the story together.' : '';
});
nodes['read-aloud'].hidden = !narrator.supported;

function render() {
  const state = quest.snapshot();
  nodes.progress.textContent = state.complete ? 'A welcome ending · Grow together' : `Moment ${state.step + 1} of 3 · ${['Notice', 'Listen', 'Make room'][state.step]}`;
  nodes['moment-title'].textContent = state.complete ? state.ending.title : state.moment.title;
  nodes.story.hidden = state.complete;
  nodes.story.textContent = state.moment?.story ?? '';
  nodes.question.hidden = state.phase !== 'choice';
  nodes.question.textContent = state.moment?.question ?? '';
  nodes.choices.hidden = state.phase !== 'choice';
  nodes.choices.replaceChildren();
  if (state.phase === 'choice') state.moment.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'quest-choice';
    const number = document.createElement('span');
    number.className = 'choice-number'; number.textContent = index + 1; number.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.textContent = choice.label;
    button.append(number, label);
    button.addEventListener('click', () => { if (quest.choose(choice.id)) update('result'); });
    nodes.choices.append(button);
  });
  nodes.result.hidden = state.phase !== 'result';
  nodes['result-title'].textContent = state.selected?.title ?? '';
  nodes['result-story'].textContent = state.selected?.story ?? '';
  nodes.ending.hidden = !state.complete;
  nodes['ending-story'].textContent = state.ending?.story ?? '';
  nodes.reflection.hidden = state.phase === 'choice';
  nodes['reflection-text'].textContent = state.ending?.question ?? state.selected?.question ?? '';
  nodes.next.hidden = state.phase !== 'result';
  nodes.next.textContent = state.step === 2 ? 'See how the story ends' : 'Continue the story';
  nodes.retry.hidden = state.phase !== 'result';
  nodes['play-again'].hidden = !state.complete;
  nodes.back.hidden = state.step === 0;
  nodes.restart.hidden = state.complete || (state.step === 0 && state.phase === 'choice');
  const joins = state.complete && state.choices[2] === 'offer-turn';
  const position = state.complete ? joins ? [443, 252] : [495, 224] : state.step === 0 ? state.selected?.id === 'ask' ? [570, 212] : [621, 205] : state.step === 1 ? [520, 225] : [475, 238];
  nodes.patience.setAttribute('x', position[0]); nodes.patience.setAttribute('y', position[1]);
  nodes['shared-petal'].toggleAttribute('hidden', !joins);
  nodes['scene-description'].textContent = state.complete ? `Blue Toby, Taboshi, and Patience together beside the petal pattern. ${joins ? 'Patience has added a fallen petal to the game.' : 'Patience enjoys watching beside the friends.'}` : `Blue Toby and Taboshi beside a pattern of fallen petals. ${state.step === 0 ? 'Patience watches from the garden path.' : 'Patience has come closer to watch one little turn.'}`;
  nodes['scene-caption'].textContent = state.complete ? 'There is more than one way to feel welcome.' : ['Sometimes a little invitation begins with noticing.', 'A little turn. A little listening.', 'An invitation leaves room for a friend’s choice.'][state.step];
  nodes['save-note'].textContent = saveQuest(storage, quest) ? 'Your place in the story is remembered in this browser.' : 'You can keep playing for this visit. The story will start fresh next time.';
}

function update(focus) {
  narrator.stop(); render();
  if (focus === 'result') nodes['result-title'].focus();
  else if (focus === 'choice') nodes.choices.children[0]?.focus();
  else nodes['moment-title'].focus();
}
function restart() { quest = createQuest(); update('moment'); }
nodes.next.addEventListener('click', () => { if (quest.next()) update('moment'); });
nodes.retry.addEventListener('click', () => { if (quest.retry()) update('choice'); });
nodes.back.addEventListener('click', () => { if (quest.back()) update('moment'); });
nodes.restart.addEventListener('click', restart);
nodes['play-again'].addEventListener('click', restart);
nodes['read-aloud'].addEventListener('click', () => {
  if (narrator.isReading()) { narrator.stop(); return; }
  const state = quest.snapshot();
  const text = state.complete ? `${state.ending.title}. ${state.ending.story} ${state.ending.question}` : state.phase === 'result' ? `${state.selected.title}. ${state.selected.story} ${state.selected.question}` : `${state.moment.title}. ${state.moment.story} ${state.moment.question} ${state.moment.choices.map(choice => choice.label).join('. ')}.`;
  narrator.read(text);
});
globalThis.addEventListener('pagehide', () => narrator.stop());
document.addEventListener('visibilitychange', () => { if (document.hidden) narrator.stop(); });
render();
nodes.quest.hidden = false;
