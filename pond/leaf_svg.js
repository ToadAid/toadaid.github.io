// leaf_svg.js — Dynamic "Reflection Leaf" SVG generator
// Exports window.createLeafSVG + window.__createLeafSVG

(function(){
  function wrapLines(text, maxChars){
    const t = String(text || "").replace(/\s+/g, " ").trim();
    if(!t) return [""];
    const words = t.split(" ");
    const out = [];
    let line = "";
    for(const w of words){
      const cand = line ? (line + " " + w) : w;
      if(cand.length <= maxChars){
        line = cand;
      }else{
        if(line) out.push(line);
        line = w;
      }
    }
    if(line) out.push(line);
    return out.length ? out : [t];
  }

  function esc(s){
    return String(s||"")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/\"/g,"&quot;")
      .replace(/'/g,"&apos;");
  }

  function createLeafSVG({
    leafNo=8,
    q="",
    a="",
    resonance="Stillness.",
    guide="What remains when urgency leaves?",
    mode="POND",
    epoch="EPOCH 5",
  }={}){
    // Normalize resonance (avoid Echo: Echo: ...)
    let res = String(resonance||"").trim();
    res = res.replace(/^\s*(Echo|Reflection Resonance)\s*:\s*/i, "").trim();
    res = res.replace(/^\s*(Echo|Reflection Resonance)\s*:\s*/i, "").trim();

    const qLines = wrapLines(`Q: ${q}`.trim(), 30).slice(0,3);
    const aLines = wrapLines(a, 32).slice(0,9);
    const gLines = wrapLines(guide, 38).slice(0,4);

    const W = 400;

    const aLineH = 22;
    const yA0 = 362;
    const aBlockH = (aLines.length ? (aLines.length-1) : 0) * aLineH;
    const yAfterA = yA0 + aBlockH;

    const yRes = yAfterA + 52;
    const yGuide = yRes + 26;
    const gLineH = 14;
    const gBlockH = (gLines.length ? (gLines.length-1) : 0) * gLineH;

    const padBottom = 70;
    const H = Math.max(600, yGuide + gBlockH + padBottom);

    const sigil  = `🪞 ${leafNo} 🌊 🌀 🍃 ⏳ ≋`;

    const qTspans = qLines.map((ln,i)=>`<tspan x="200" dy="${i?18:0}">${esc(ln)}</tspan>`).join("");
    const aTspans = aLines.map((ln,i)=>`<tspan x="200" dy="${i?aLineH:0}">${esc(ln)}</tspan>`).join("");
    const gTspans = gLines.map((ln,i)=>`<tspan x="200" dy="${i?gLineH:0}">${esc(ln)}</tspan>`).join("");

    const gridV = [80,140,200,260,320].map(x=>`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="white" opacity="0.03"/>`).join("");
    const gridH = [120,220,320,420,520].map(y=> y < H ? `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="white" opacity="0.03"/>` : "").join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#0ad7a6" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#003b46" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#001219"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g>${gridV}${gridH}</g>

  <rect x="18" y="18" width="${W-36}" height="${H-36}" rx="28" fill="none" stroke="#f5d06a" stroke-opacity="0.55" stroke-width="2" filter="url(#glow)"/>

  <text x="200" y="64" text-anchor="middle" fill="#f5d06a" font-family="Cinzel, serif" font-size="11" letter-spacing="3">REFLECTION LEAF · ${esc(mode)}</text>

  <circle cx="200" cy="142" r="42" fill="#0ad7a6" fill-opacity="0.18" stroke="#0ad7a6" stroke-opacity="0.35"/>
  <text x="200" y="154" text-anchor="middle" fill="#c8fff2" font-family="Cinzel, serif" font-size="34">${esc(String(leafNo))}</text>

  <text x="200" y="214" text-anchor="middle" fill="#bfe9ff" font-family="Cinzel, serif" font-size="10" letter-spacing="3">INQUIRY</text>
  <text x="200" y="250" text-anchor="middle" fill="#dcefff" font-family="Georgia, serif" font-size="16" font-style="italic">
    ${qTspans}
  </text>

  <text x="200" y="330" text-anchor="middle" fill="#bfe9ff" font-family="Cinzel, serif" font-size="10" letter-spacing="3">REFLECTION</text>
  <text x="200" y="${yA0}" text-anchor="middle" fill="#e9f7ff" font-family="Georgia, serif" font-size="18" font-style="italic">
    ${aTspans}
  </text>

  <text x="200" y="${yRes}" text-anchor="middle" fill="#7fe8d1" font-family="Inter, sans-serif" font-size="11" opacity="0.9">${esc(res || "Stillness.")}</text>

  <text x="200" y="${yGuide}" text-anchor="middle" fill="#9fd7ff" font-family="Inter, sans-serif" font-size="10" opacity="0.85">Guiding: <tspan fill="#cfefff">${gTspans}</tspan></text>

  <text x="200" y="${H-64}" text-anchor="middle" fill="#f5d06a" font-family="Inter, sans-serif" font-size="13">${esc(sigil)}</text>
  <text x="200" y="${H-38}" text-anchor="middle" fill="#bfe9ff" font-family="Inter, sans-serif" font-size="10" opacity="0.8">VERIFIED IN POND · ${esc(epoch)}</text>
</svg>`;
  }

  window.createLeafSVG = createLeafSVG;
  window.__createLeafSVG = createLeafSVG;
})();
