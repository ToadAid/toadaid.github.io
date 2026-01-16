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
    const t = String(text || '').trim().replace(/\s+/g,' ');
    if (!t) return [];
    const words = t.split(' ');
    const lines = [];
    let line = '';
    for (const w of words){
      const test = line ? (line + ' ' + w) : w;
      if (test.length > maxChars && line){
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function createElasticLeafSVG({ inquiry, reflection, epoch } = {}){
    const W = 400;
    const topPad = 40;
    const baseHeight = 420;
    const lineH = 26;

    const inquiryText = String(inquiry || '').trim();
    const reflectionText = String(reflection || '').trim();

    // Wrap inquiry a bit too (single-ish line in design, but let it wrap softly)
    const inquiryLines = wrapByChars(inquiryText, 34);
    const reflectionLines = wrapByChars(reflectionText, 38);

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
      `<text x="200" y="${reflectionYStart + i*lineH}" text-anchor="middle" fill="#ecfeff" font-size="18" font-style="italic">${esc(l)}</text>`
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
