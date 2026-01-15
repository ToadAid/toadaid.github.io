import { parseMirror, generateLeafSVG, buildMetadata } from "./leaf_svg.js";

async function onFreezeAndMint() {
  // 1) get reflection from your API (or from your UI state)
  const q = currentQuestion;
  const raw = currentMirrorRawOutput; // OR fetch it live

  const { reflection, resonance, guiding } = parseMirror(raw);

  // 2) generate SVG + preview
  const svg = generateLeafSVG({
    q,
    reflection,
    resonance,
    guiding,
    leafNo: "LOCAL", // later replace with tokenId or sequence
    epoch: "5",
  });

  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(svg)));
  const dataUri = `data:image/svg+xml;base64,${b64}`;

  // show preview in your UI
  document.getElementById("leafPreview").src = dataUri;

  // 3) build metadata (for tokenURI if your contract expects it)
  const meta = buildMetadata({
    name: `Reflection Leaf`,
    description: "A reflection from the Digital Pond.",
    svgString: svg,
    attributes: [
      { trait_type: "Epoch", value: "5" },
      { trait_type: "Seal", value: "🪞8🌊∞🍃" },
    ],
  });

  // 4) mint step (depends on your contract/Zora flow)
  // If your mint expects a tokenURI string:
  // const tokenUri = "data:application/json;base64," + btoa(JSON.stringify(meta));
  // pass tokenUri into mint(...)
}
