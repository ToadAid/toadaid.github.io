function generateElasticLeafSVG({ inquiry, reflection }) {
  const lineHeight = 26;

  function wrapText(text) {
    const words = text.split(" ");
    let lines = [];
    let line = "";
    for (let w of words) {
      const test = line + w + " ";
      if (test.length > 40) {
        lines.push(line.trim());
        line = w + " ";
      } else {
        line = test;
      }
    }
    lines.push(line.trim());
    return lines;
  }

  const reflectionLines = wrapText(reflection);
  const reflectionHeight = reflectionLines.length * lineHeight;
  const baseHeight = 420;
  const totalHeight = baseHeight + reflectionHeight;

  let reflectionText = reflectionLines.map((l, i) =>
    `<text x="200" y="${260 + i * lineHeight}" text-anchor="middle"
      fill="#ecfeff" font-size="18" font-style="italic">${l}</text>`
  ).join("");

  return `
<svg width="100%" viewBox="0 0 400 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>

  <rect width="400" height="${totalHeight}" rx="28" fill="url(#bg)" />

  <text x="200" y="50" text-anchor="middle" fill="#fde68a"
        font-size="14" letter-spacing="3">REFLECTION LEAF · POND</text>

  <circle cx="200" cy="110" r="36" fill="#10b981"/>
  <text x="200" y="118" text-anchor="middle" fill="#022c22" font-size="22">8</text>

  <text x="200" y="170" text-anchor="middle" fill="#34d399"
        font-size="12" letter-spacing="2">INQUIRY</text>
  <text x="200" y="200" text-anchor="middle" fill="#d1fae5"
        font-size="16">${inquiry}</text>

  <text x="200" y="235" text-anchor="middle" fill="#fde68a"
        font-size="12" letter-spacing="2">REFLECTION</text>

  ${reflectionText}

  <text x="200" y="${totalHeight - 40}" text-anchor="middle"
        fill="#64748b" font-size="10">VERIFIED IN POND · EPOCH 5</text>
</svg>`;
}
