const choice = (id, label, title, story, question) => Object.freeze({ id, label, title, story, question });
export const MOMENTS = Object.freeze([
  Object.freeze({
    title: 'Someone beside the game',
    story: 'Blue Toby and Taboshi are making a little pattern with fallen petals. Patience stands beside the path, watching. Toby notices his friend and wonders what they might like.',
    question: 'What could Toby try?',
    choices: Object.freeze([
      choice('ask', 'Ask if Patience would like to join', 'An invitation, with room to choose', '“Would you like to play with us?” asks Toby. “Perhaps,” says Patience. “I don’t know the game yet.” Toby is glad he asked instead of guessing.', 'What could you say when you invite someone to a game?'),
      choice('job', 'Choose a job for Patience', 'A little moment to ask', '“You can collect the petals!” says Toby. Patience pauses. “I’d like to watch first. I don’t know the game yet.” Toby realises his friend has a choice too. “Thank you for telling me,” he says.', 'How could Toby find out what his friend would like?')
    ])
  }),
  Object.freeze({
    title: 'One little turn',
    story: '“Could I watch one little turn?” asks Patience. Taboshi makes a space beside the petal pattern. Toby thinks about how to show the game.',
    question: 'What could Toby do next?',
    choices: Object.freeze([
      choice('small-step', 'Show one small step, then pause', 'A little step to notice', 'Toby puts one petal beside another. “That is my turn,” he says. Patience watches closely. Taboshi smiles. There is time to look, ask a question, or simply enjoy watching.', 'What is something you could show a friend one step at a time?'),
      choice('all-rules', 'Explain all the rules at once', 'Making room for a slower pace', 'Toby begins explaining every part of the game. “That is a lot to remember,” says Patience. Toby stops to listen. “Let’s begin with one little turn,” he says. The friends slow down together.', 'What can you do when an explanation feels too fast?')
    ])
  }),
  Object.freeze({
    title: 'A place beside Toby',
    story: 'Patience has watched a quiet turn. Toby notices that there are different ways to enjoy an afternoon together. He wants his friend to feel welcome.',
    question: 'What could Toby offer?',
    choices: Object.freeze([
      choice('offer-turn', 'Offer a turn whenever Patience is ready', 'A turn, when a friend chooses', '“Would you like a turn, or would you like to keep watching?” asks Toby. Patience thinks for a moment. “I’d like to place one petal now.” Taboshi makes a space in the pattern.', 'How can you invite someone while leaving them free to choose?'),
      choice('watch-beside', 'Invite Patience to watch beside us', 'A welcome place to watch', '“You can sit beside us and watch as long as you like,” says Toby. Patience settles near the pattern. “I’d like that today.” Taboshi moves a little closer so all three can see.', 'How could you help someone feel included even if they do not want a turn?')
    ])
  })
]);

export const ENDINGS = Object.freeze({
  'offer-turn': Object.freeze({ title: 'One petal. Three good friends.', story: 'Patience chooses a fallen petal and places it gently in the pattern. Toby and Taboshi make room. They have not hurried their friend or decided for them. They have asked, listened, and shared a little turn.', question: 'What is one small way you could make room for someone today?' }),
  'watch-beside': Object.freeze({ title: 'There is room to be together.', story: 'Patience enjoys watching beside the friends. Toby places a petal, and Taboshi notices its colour. Nobody needs to take a turn to have a welcome place. For today, being beside one another is enough.', question: 'When do you like joining in, and when do you like watching first?' })
});
export const SAVE_KEY = 'toadaid-kindness-quest-v1';

function valid(record) {
  if (!record || record.version !== 1 || !Number.isInteger(record.step) || record.step < 0 || record.step > MOMENTS.length || !Array.isArray(record.choices) || record.choices.length !== MOMENTS.length) return false;
  let empty = false;
  for (let i = 0; i < MOMENTS.length; i++) {
    const selected = record.choices[i];
    if (selected === null) { empty = true; if (i < record.step) return false; }
    else if (empty || !MOMENTS[i].choices.some(choice => choice.id === selected)) return false;
  }
  return true;
}

export function createQuest(record) {
  let step = valid(record) ? record.step : 0;
  let choices = valid(record) ? [...record.choices] : MOMENTS.map(() => null);
  return {
    snapshot() {
      const complete = step === MOMENTS.length;
      const moment = complete ? null : MOMENTS[step];
      const selected = complete ? null : moment.choices.find(choice => choice.id === choices[step]) ?? null;
      return { step, choices: [...choices], complete, phase: complete ? 'ending' : selected ? 'result' : 'choice', moment, selected, ending: complete ? ENDINGS[choices.at(-1)] : null };
    },
    choose(id) {
      if (step === MOMENTS.length || choices[step] !== null || !MOMENTS[step].choices.some(choice => choice.id === id)) return false;
      choices[step] = id;
      return true;
    },
    next() { if (step === MOMENTS.length || choices[step] === null) return false; step++; return true; },
    back() { if (step === 0) return false; step--; return true; },
    retry() { if (step === MOMENTS.length || choices[step] === null) return false; choices = choices.map((choice, i) => i < step ? choice : null); return true; },
    serialize() { return { version: 1, step, choices: [...choices] }; }
  };
}
export function loadQuest(storage) {
  try { const record = JSON.parse(storage.getItem(SAVE_KEY)); return valid(record) ? record : null; }
  catch { return null; }
}
export function saveQuest(storage, quest) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(quest.serialize())); return true; }
  catch { return false; }
}
