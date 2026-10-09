(() => {
  const moments = [
    { title: 'Look with Taboshi', text: 'Taboshi notices the little green things by the pond. Look around you. Can you find something green? Tell your reading buddy what you see.' },
    { title: 'Listen with Patience', text: 'Patience pauses by the water. Listen for a moment. What sound can you hear? A bird, a voice, or perhaps a very quiet room? Any answer is welcome.' },
    { title: 'Breathe with Blue Toby', text: 'Toby rests his little feet. If you like, take one easy breath in and out. There is no hurry. You can also just sit with your buddy for a moment.' },
    { title: 'A little moment, together', text: 'Toby, Taboshi, and Patience each noticed something different. Tell your buddy one thing you noticed. Thank you for sharing this little moment with your friends.' },
  ];
  const byId = id => document.getElementById(id);
  const next = byId('next-step');
  const reset = byId('start-again');
  const dots = document.querySelectorAll('.quiet-progress li');
  let position = 0;
  function render() {
    byId('step-count').textContent = `Moment ${position + 1} of ${moments.length}`;
    byId('step-title').textContent = moments[position].title;
    byId('step-text').textContent = moments[position].text;
    dots.forEach((dot, index) => dot.classList.toggle('done', index <= position));
    const finished = position === moments.length - 1;
    next.hidden = finished;
    byId('back-to-garden').hidden = !finished;
    // Keep keyboard focus on a visible control when the last prompt hides Next.
    if (finished && document.activeElement === next) reset.focus();
  }
  next.addEventListener('click', () => {
    if (position < moments.length - 1) { position += 1; render(); }
  });
  reset.addEventListener('click', () => { position = 0; render(); next.focus(); });
  render();
  byId('activity-controls').hidden = false;
})();
