export function createNarrator(api, Utterance, onState = () => {}) {
  const supported = Boolean(api && typeof api.speak === 'function' && typeof api.cancel === 'function' && typeof Utterance === 'function');
  let token = 0;
  let reading = false;
  function stop() {
    token++;
    const wasReading = reading;
    reading = false;
    if (supported && wasReading) { try { api.cancel(); } catch { /* Text remains available. */ } }
    onState('idle');
  }
  return {
    supported,
    isReading() { return reading; },
    stop,
    read(text) {
      if (!supported) return false;
      stop();
      const current = token;
      try {
        const utterance = new Utterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        const voices = api.getVoices?.() ?? [];
        const voice = voices.find(voice => voice.localService && /^en\b/i.test(voice.lang)) ?? voices.find(voice => /^en\b/i.test(voice.lang));
        if (voice) utterance.voice = voice;
        const finish = state => { if (current !== token) return; reading = false; onState(state); };
        utterance.onend = () => finish('idle');
        utterance.onerror = () => finish('error');
        reading = true;
        onState('reading');
        api.speak(utterance);
        return true;
      } catch { reading = false; onState('error'); return false; }
    }
  };
}
