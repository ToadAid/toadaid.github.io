/* leaf_svg.js - Elastic Reflection Leaf SVG generator (no modules)
   Now with larger canvas and better text wrapping for longer reflections
   Exposes: window.__createLeafSVG(payload)
   payload: { leafNo?, q, a, resonance?, guide?, mode?, epoch? }
*/
(function(){
  function xmlEsc(s){
    return String(s ?? "")
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&apos;');
  }

  // Smart text wrapping with max chars per line
  function wrapText(text, maxChars){
    const t = String(text || '').trim();
    if (!t) return [];
    
    const words = t.split(/\s+/).filter(Boolean);
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (testLine.length <= maxChars) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // Create text spans for SVG
  function createTextSpans(x, y, lines, lineHeight, className, fontSize, color, align = 'middle') {
    let svg = `<text x="${x}" y="${y}" text-anchor="${align}" class="${className}" font-size="${fontSize}" fill="${color}">`;
    
    lines.forEach((line, index) => {
      const dy = index === 0 ? '0' : lineHeight;
      svg += `<tspan x="${x}" dy="${dy}">${xmlEsc(line)}</tspan>`;
    });
    
    svg += '</text>';
    return svg;
  }

  function createLeafSVG({ 
    leafNo = 8, 
    q = "", 
    a = "", 
    resonance = "Stillness.", 
    guide = "What remains when urgency leaves?", 
    mode = "POND", 
    epoch = "EPOCH 5" 
  } = {}) {
    
    // Larger canvas dimensions
    const WIDTH = 600;
    const HEIGHT = 800;
    const CX = WIDTH / 2;
    
    // Text wrapping settings
    const qLines = wrapText(`Q: ${q}`, 36);
    const aLines = wrapText(a, 40);
    const guideLines = wrapText(`Guiding: ${guide}`, 42);
    
    // Calculate dynamic heights
    const titleHeight = 60;
    const sectionSpacing = 60;
    
    // Positions
    const titleY = 70;
    const leafNoY = 150;
    const inquiryLabelY = 220;
    const inquiryTextY = 260;
    const reflectionLabelY = inquiryTextY + (qLines.length * 24) + 40;
    const reflectionTextY = reflectionLabelY + 30;
    const guideY = reflectionTextY + (aLines.length * 28) + 40;
    const sigilY = guideY + (guideLines.length * 20) + 30;
    const footerY = HEIGHT - 30;
    
    const sigil = `🪞 ${leafNo} 🌊 🌀 🍃 ⏳ ≋`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    
    <!-- Gold gradient for decorative elements -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e6c27a" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#e6c27a" stop-opacity="0.85"/>
    </linearGradient>
    
    <!-- Soft glow filter -->
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- CSS styles for text -->
    <style>
      .title { font-family: 'Cinzel', serif; font-weight: bold; }
      .label { font-family: 'Cinzel', serif; }
      .q-text { font-family: 'Cinzel', serif; font-style: italic; }
      .a-text { font-family: 'Cinzel', serif; font-style: italic; }
      .meta { font-family: 'Inter', sans-serif; }
      .tiny { font-family: 'Inter', sans-serif; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" rx="32" fill="url(#bgGrad)"/>
  
  <!-- Decorative grid lines (subtle) -->
  <g opacity="0.06" stroke="#10b981" stroke-width="0.5">
    <line x1="0" y1="${HEIGHT * 0.2}" x2="${WIDTH}" y2="${HEIGHT * 0.2}"/>
    <line x1="0" y1="${HEIGHT * 0.4}" x2="${WIDTH}" y2="${HEIGHT * 0.4}"/>
    <line x1="0" y1="${HEIGHT * 0.6}" x2="${WIDTH}" y2="${HEIGHT * 0.6}"/>
    <line x1="0" y1="${HEIGHT * 0.8}" x2="${WIDTH}" y2="${HEIGHT * 0.8}"/>
    <line x1="${WIDTH * 0.25}" y1="0" x2="${WIDTH * 0.25}" y2="${HEIGHT}"/>
    <line x1="${WIDTH * 0.5}" y1="0" x2="${WIDTH * 0.5}" y2="${HEIGHT}"/>
    <line x1="${WIDTH * 0.75}" y1="0" x2="${WIDTH * 0.75}" y2="${HEIGHT}"/>
  </g>
  
  <!-- Decorative border path -->
  <path filter="url(#softGlow)"
    d="M40 36
      C30 80, 30 120, 36 160
      C24 240, 26 400, 38 520
      C26 620, 40 720, 68 758
      C120 792, 210 796, 292 790
      C350 786, 374 742, 380 696
      C392 614, 388 440, 372 320
      C386 250, 380 162, 356 128
      C320 98, 260 98, 200 102
      C140 98, 80 98, 40 116 Z"
    fill="none" stroke="url(#goldGrad)" stroke-width="2.5" opacity="0.6"/>
  
  <!-- Title -->
  <text x="${CX}" y="${titleY}" text-anchor="middle" class="title" font-size="22" fill="#e6c27a" letter-spacing="4">
    REFLECTION LEAF · ${xmlEsc(mode)}
  </text>
  
  <!-- Leaf number in circle -->
  <circle cx="${CX}" cy="${leafNoY}" r="70" fill="#10b981" opacity="0.15"/>
  <circle cx="${CX}" cy="${leafNoY}" r="50" fill="#10b981" opacity="0.3"/>
  <text x="${CX}" y="${leafNoY + 10}" text-anchor="middle" font-family="Cinzel" font-size="48" fill="#eafff7" opacity="0.8">
    ${leafNo}
  </text>
  
  <!-- Inquiry Label -->
  <text x="${CX}" y="${inquiryLabelY}" text-anchor="middle" class="label" font-size="16" fill="#34d399" letter-spacing="2">
    INQUIRY
  </text>
  
  <!-- Inquiry Text -->
  ${createTextSpans(CX, inquiryTextY, qLines, '24', 'q-text', '18', '#e5e7eb')}
  
  <!-- Reflection Label -->
  <text x="${CX}" y="${reflectionLabelY}" text-anchor="middle" class="label" font-size="16" fill="#fde68a" letter-spacing="2">
    REFLECTION
  </text>
  
  <!-- Reflection Text -->
  ${createTextSpans(CX, reflectionTextY, aLines, '28', 'a-text', '22', '#ffffff')}
  
  <!-- Guiding Question -->
  ${createTextSpans(CX, guideY, guideLines, '20', 'meta', '14', '#94a3b8')}
  
  <!-- Resonance -->
  <text x="${CX}" y="${guideY + (guideLines.length * 20) + 20}" text-anchor="middle" class="meta" font-size="12" fill="#64748b">
    ${xmlEsc(resonance)}
  </text>
  
  <!-- Sigil -->
  <text x="${CX}" y="${sigilY}" text-anchor="middle" font-size="22" fill="#d1d5db" opacity="0.9">
    ${xmlEsc(sigil)}
  </text>
  
  <!-- Footer -->
  <text x="${CX}" y="${footerY}" text-anchor="middle" class="tiny" font-size="10" fill="#64748b">
    VERIFIED IN POND · ${xmlEsc(epoch)}
  </text>
</svg>`;
  }

  // Also create a simpler version for the Freeze modal preview
  function createCompactLeafSVG({ q = "", a = "" } = {}) {
    const W = 400;
    const H = 500;
    const CX = W / 2;
    
    const qLines = wrapText(q, 30).slice(0, 2);
    const aLines = wrapText(a, 35).slice(0, 4);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cg" cx="50%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  
  <rect width="${W}" height="${H}" rx="20" fill="url(#cg)"/>
  
  <text x="${CX}" y="50" text-anchor="middle" font-family="Cinzel" font-size="16" fill="#e6c27a">REFLECTION LEAF</text>
  
  <circle cx="${CX}" cy="120" r="40" fill="#10b981" opacity="0.3"/>
  <text x="${CX}" y="128" text-anchor="middle" font-family="Cinzel" font-size="32" fill="#ffffff">8</text>
  
  <text x="${CX}" y="180" text-anchor="middle" font-family="Cinzel" font-size="12" fill="#34d399">INQUIRY</text>
  ${createTextSpans(CX, 210, qLines, '20', '', '14', '#d1fae5')}
  
  <text x="${CX}" y="280" text-anchor="middle" font-family="Cinzel" font-size="12" fill="#fde68a">REFLECTION</text>
  ${createTextSpans(CX, 310, aLines, '24', '', '16', '#ecfeff', 'middle')}
  
  <text x="${CX}" y="450" text-anchor="middle" font-size="10" fill="#64748b">POND VERIFICATION</text>
</svg>`;
  }

  // Expose both functions
  window.__createLeafSVG = createLeafSVG;
  window.__createCompactLeafSVG = createCompactLeafSVG;
  
  console.log('Leaf SVG generator loaded - larger canvas with auto-fitting text');
})();
[file content end]