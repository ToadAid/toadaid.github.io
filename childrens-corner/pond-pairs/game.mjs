import { createRound, FRIENDS } from './engine.mjs';

const game = document.getElementById('game');
const board = document.getElementById('cards');
const message = document.getElementById('message');
const progress = document.getElementById('progress');
const turnBack = document.getElementById('continue');
const restart = document.getElementById('restart');
const win = document.getElementById('win');
let round = createRound();

const buttons = Array.from({ length: 6 }, (_, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pair-card';
  button.innerHTML = `<span class="card-back" aria-hidden="true"><svg viewBox="0 0 120 120" focusable="false"><use href="friends.svg#pond"></use></svg><span class="card-number">${index + 1}</span></span><span class="card-front" aria-hidden="true" hidden><svg viewBox="0 0 120 120" focusable="false"><use></use></svg><span class="friend-name"></span><span class="match-label" hidden>Pair found</span></span>`;
  button.addEventListener('click', () => {
    const result = round.choose(index);
    if (!result) return;
    render();
    if (result.kind === 'first') message.textContent = `${result.name}! Choose another card to find the same friend.`;
    if (result.kind === 'miss') {
      message.textContent = 'Two different friends. Take a look, then turn them back when you are ready.';
      turnBack.focus();
    }
    if (result.kind === 'match') message.textContent = `You found ${result.name}’s pair! ${round.snapshot().found.length} of 3 pairs found. Choose another card.`;
    if (result.kind === 'complete') message.textContent = 'You found all three pairs! Blue Toby, Taboshi, and Patience are together. Play again whenever you like.';
  });
  board.append(button);
  return button;
});

function render() {
  const state = round.snapshot();
  state.cards.forEach((card, index) => {
    const button = buttons[index];
    const revealed = card.state !== 'hidden';
    const friend = FRIENDS.find(item => item.id === card.friend);
    button.dataset.state = card.state;
    button.setAttribute('aria-pressed', String(revealed));
    button.setAttribute('aria-disabled', String(revealed || state.waiting));
    button.setAttribute('aria-label', revealed ? `Card ${index + 1}: ${friend.name}${card.state === 'matched' ? ', pair found' : ''}` : `Card ${index + 1}: face down`);
    button.querySelector('.card-back').hidden = revealed;
    button.querySelector('.card-front').hidden = !revealed;
    button.querySelector('.card-front use').setAttribute('href', `friends.svg#${friend.id}`);
    button.querySelector('.friend-name').textContent = friend.name;
    button.querySelector('.match-label').hidden = card.state !== 'matched';
  });
  progress.textContent = `${state.found.length} of 3 pairs found`;
  turnBack.hidden = !state.waiting;
  win.hidden = !state.complete;
}

turnBack.addEventListener('click', () => {
  const index = round.continue();
  if (index === null) return;
  render();
  message.textContent = 'Ready for another look? Choose a card.';
  buttons[index].focus();
});
restart.addEventListener('click', () => {
  round = createRound();
  render();
  message.textContent = 'A fresh little pond! Choose a card to meet a friend.';
  buttons[0].focus();
});
render();
game.hidden = false;
