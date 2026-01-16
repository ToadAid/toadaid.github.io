/* leaf_svg.js - Enhanced Elastic Reflection Leaf SVG generator
   Exposes: window.__createLeafSVG(payload)
   payload: { inquiry, reflection, epoch?, tag? }
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

  // Smart text wrapping for SVG (char-based with word awareness)
  function wrapText(text, maxChars, maxLines = 10) {
    const t = String(text || '').trim().replace(/\s+/g, ' ');
    if (!t) return [];
    
    const words = t.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      // If adding this word would exceed maxChars, start new line
      if (testLine.length > maxChars) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Single word longer than maxChars? Split it
          lines.push(word.substring(0, maxChars));
          currentLine = word.substring(maxChars) || '';
        }
        
        // Stop if we've reached maxLines
        if (lines.length >= maxLines) {
          // Add ellipsis to last line if truncated
          if (lines.length === maxLines) {
            const lastLine = lines[maxLines - 1];
            if (lastLine.length > maxChars - 3) {
              lines[maxLines - 1] = lastLine.substring(0, maxChars - 3) + '...';
            }
          }
          return lines;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  function createElasticLeafSVG({ inquiry, reflection, epoch = '5', tag = 'STILLNESS' } = {}) {
    const WIDTH = 400;
    const MIN_HEIGHT = 520;
    const MAX_HEIGHT = 800; // Cap at reasonable height
    
    // Calculate content dimensions
    const inquiryLines = wrapText(inquiry, 38, 2); // Max 2 lines for inquiry
    const reflectionLines = wrapText(reflection, 36, 8); // Max 8 lines for reflection
    
    // Dynamic height calculation
    const headerHeight = 120;
    const footerHeight = 60;
    const inquiryHeight = Math.max(1, inquiryLines.length) * 22;
    const reflectionHeight = Math.max(1, reflectionLines.length) * 28;
    const spacing = 80; // Space between sections
    
    let totalHeight = headerHeight + inquiryHeight + spacing + reflectionHeight + footerHeight;
    totalHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, totalHeight));
    
    // Calculate Y positions
    const inquiryYStart = 140;
    const reflectionYStart = inquiryYStart + inquiryHeight + 60;
    
    // Build SVG with better styling
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${totalHeight}" viewBox="0 0 ${WIDTH} ${totalHeight}" 
      xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#065f46"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
    
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fde68a" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.6"/>
    </linearGradient>
    
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <style>
      .title { font-family: 'Cinzel', serif; fill: #e6c27a; }
      .inquiry-label { font-family: 'Cinzel', serif; fill: #34d399; }
      .reflection-label { font-family: 'Cinzel', serif; fill: #fde68a; }
      .inquiry-text { font-family: 'Inter', sans-serif; fill: #d1fae5; }
      .reflection-text { font-family: 'Cinzel', serif; fill: #ffffff; font-style: italic; }
      .footer { font-family: 'Inter', sans-serif; fill: #64748b; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${WIDTH}" height="${totalHeight}" rx="28" fill="url(#bgGrad)"/>
  
  <!-- Decorative border -->
  <rect x="10" y="10" width="${WIDTH-20}" height="${totalHeight-20}" rx="22" 
        fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.3"/>
  
  <!-- Header -->
  <text x="${WIDTH/2}" y="50" text-anchor="middle" class="title" font-size="14" letter-spacing="4">
    REFLECTION LEAF · ${esc(tag)}
  </text>
  
  <!-- Pond sigil -->
  <circle cx="${WIDTH/2}" cy="95" r="32" fill="#10b981" opacity="0.15"/>
  <text x="${WIDTH/2}" y="102" text-anchor="middle" fill="#022c22" font-size="24" font-weight="bold">8</text>
  
  <!-- Inquiry section -->
  <text x="${WIDTH/2}" y="${inquiryYStart - 10}" text-anchor="middle" 
        class="inquiry-label" font-size="12" letter-spacing="2">
    INQUIRY
  </text>
  
  ${inquiryLines.map((line, i) => `
    <text x="${WIDTH/2}" y="${inquiryYStart + (i * 22)}" text-anchor="middle" 
          class="inquiry-text" font-size="14">
      ${esc(line)}
    </text>
  `).join('')}
  
  <!-- Reflection section -->
  <text x="${WIDTH/2}" y="${reflectionYStart - 10}" text-anchor="middle" 
        class="reflection-label" font-size="12" letter-spacing="2">
    REFLECTION
  </text>
  
  ${reflectionLines.map((line, i) => `
    <text x="${WIDTH/2}" y="${reflectionYStart + (i * 28)}" text-anchor="middle" 
          class="reflection-text" font-size="18">
      ${esc(line)}
    </text>
  `).join('')}
  
  <!-- Footer -->
  <text x="${WIDTH/2}" y="${totalHeight - 25}" text-anchor="middle" 
        class="footer" font-size="10">
    VERIFIED IN POND · EPOCH ${esc(epoch)}
  </text>
  
  <text x="${WIDTH/2}" y="${totalHeight - 8}" text-anchor="middle" 
        class="footer" font-size="9" opacity="0.7">
    🪞 🌊 🍃 ⏳ ≋
  </text>
</svg>`;
  }

  // Expose to global scope
  window.__createLeafSVG = createElasticLeafSVG;
})();
