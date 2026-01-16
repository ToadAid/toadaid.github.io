/* leaf_svg.js - Elastic Reflection Leaf SVG generator (no modules)
   Exposes: window.__createLeafSVG(payload)
   payload: { inquiry, reflection, epoch?, mark?, tag? }
*/
(function(){
  function esc(s){
    return String(s ?? "")
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&apos;');
  }

  // Very light "layout" - wraps by chars (good enough for mobile + SVG)
  function wrapByChars(text, maxChars){
    // Preserve intentional line breaks (and blank lines) so the leaf can grow taller.
    const src = String(text || '').replace(/\r\n?/g,'\n');
    const lines = src.split('\n');
    const out = [];

    for (let rawLine of lines) {
      rawLine = (rawLine || '').trim();
      if (!rawLine) {
        out.push('');
        continue;
      }

      const words = rawLine.split(/\s+/).filter(Boolean);
      let cur = '';
      for (const w of words) {
        const next = cur ? (cur + ' ' + w) : w;
        if (next.length <= maxChars) {
          cur = next;
        } else {
          if (cur) out.push(cur);
          // If a single word is too long, hard-split it.
          if (w.length > maxChars) {
            for (let i=0;i<w.length;i+=maxChars) out.push(w.slice(i,i+maxChars));
            cur = '';
          } else {
            cur = w;
          }
        }
      }
      if (cur) out.push(cur);
    }

    // Trim leading/trailing blank lines, but keep internal ones.
    while (out.length && out[0] === '') out.shift();
    while (out.length && out[out.length-1] === '') out.pop();
    return out;
  }

function createElasticLeafSVG({ inquiry, reflection, epoch } = {}){
    const W = 400;
    const topPad = 40;
    const baseHeight = 420;
    let fontSize = 18;
    let lineH = 26;

    const inquiryText = String(inquiry || '').trim();
    const reflectionText = String(reflection || '').trim();

    // Wrap inquiry a bit too (single-ish line in design, but let it wrap softly)
    const inquiryLines = wrapByChars(inquiryText, 34);
    const reflectionLines = wrapByChars(reflectionText, 38);

    // Auto-fit: if the reflection is long, grow the leaf (height) and gently shrink text.
    const lineCount = reflectionLines.length;
    if (lineCount > 18) { fontSize = 16; lineH = 23; }
    if (lineCount > 24) { fontSize = 14; lineH = 20; }


    const inquiryBlockH = Math.max(1, inquiryLines.length) * 18;
    const reflectionBlockH = Math.max(1, reflectionLines.length) * lineH;

    const totalHeight = Math.max(520, baseHeight + inquiryBlockH + reflectionBlockH);

    const inquiryYStart = 200;
    const inquiryLineH = 18;

    const inquirySvg = inquiryLines.map((l, i) =>
      `<text x="200" y="${inquiryYStart + i*inquiryLineH}" text-anchor="middle" fill="#d1fae5" font-size="15">${esc(l)}</text>`
    ).join('');

    const reflectionYStart = 260 + Math.max(0, inquiryLines.length-1)*inquiryLineH;
    const reflectionSvg = reflectionLines.map((l, i) =>
      `<text x="200" y="${reflectionYStart + i*lineH}" text-anchor="middle" fill="#ecfeff" font-size="${fontSize}" font-style="italic">${esc(l)}</text>`
    ).join('');

    const footer = `VERIFIED IN POND · ${esc(epoch ? `EPOCH ${epoch}` : 'EPOCH 5')}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100%" viewBox="0 0 ${W} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.6"/>
    </filter>
  </defs>

  <rect width="${W}" height="${totalHeight}" rx="28" fill="url(#bg)"/>

  <text x="200" y="50" text-anchor="middle" fill="#fde68a" font-size="14" letter-spacing="3">REFLECTION LEAF · POND</text>

  <circle cx="200" cy="110" r="36" fill="#10b981" filter="url(#soft)"/>
  <text x="200" y="118" text-anchor="middle" fill="#022c22" font-size="22">8</text>

  <text x="200" y="170" text-anchor="middle" fill="#34d399" font-size="12" letter-spacing="2">INQUIRY</text>
  ${inquirySvg}

  <text x="200" y="235" text-anchor="middle" fill="#fde68a" font-size="12" letter-spacing="2">REFLECTION</text>
  ${reflectionSvg}

  <text x="200" y="${totalHeight - 40}" text-anchor="middle" fill="#64748b" font-size="10">${footer}</text>
</svg>`;
  }

  window.__createLeafSVG = createElasticLeafSVG;
})();
