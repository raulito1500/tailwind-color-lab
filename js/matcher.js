import { TAILWIND_COLOR_LIST, TAILWIND_BASE_COLORS } from "./colors.js";
import { hexToRgb, rgbToHex, rgbToLab, deltaE76, isValidHex, copyToClipboard } from "./utils.js";

const CLOSE_MATCH_THRESHOLD = 5;

const SEARCH_INDEX = [
  ...TAILWIND_COLOR_LIST,
  ...Object.entries(TAILWIND_BASE_COLORS).map(([name, { hex, oklch }]) => ({
    family: name,
    shade: null,
    hex,
    oklch,
    className: name,
  })),
].map((entry) => ({ ...entry, lab: rgbToLab(hexToRgb(entry.hex)) }));

function findClosestMatches(hex) {
  const targetLab = rgbToLab(hexToRgb(hex));
  const ranked = SEARCH_INDEX.map((entry) => ({
    ...entry,
    deltaE: deltaE76(targetLab, entry.lab),
  })).sort((a, b) => a.deltaE - b.deltaE);

  const matches = [ranked[0]];
  if (ranked[1].deltaE - ranked[0].deltaE < CLOSE_MATCH_THRESHOLD) {
    matches.push(ranked[1]);
  }
  return matches;
}

function renderMatchCard(rank, match) {
  const swatch = document.getElementById(`matcher-match-${rank}-swatch`);
  const classEl = document.getElementById(`matcher-match-${rank}-class`);
  const hexEl = document.getElementById(`matcher-match-${rank}-hex`);
  const deltaEl = document.getElementById(`matcher-match-${rank}-delta`);
  const copyButton = document.getElementById(`matcher-match-${rank}-copy`);

  const className = `bg-${match.className}`;
  swatch.style.backgroundColor = match.hex;
  classEl.textContent = className;
  hexEl.textContent = match.hex.toUpperCase();
  deltaEl.textContent = match.deltaE < 0.1 ? "Exact match" : `ΔE ${match.deltaE.toFixed(1)}`;

  copyButton.onclick = async () => {
    await copyToClipboard(className);
    const original = copyButton.textContent;
    copyButton.textContent = "Copied!";
    copyButton.disabled = true;
    setTimeout(() => {
      copyButton.textContent = original;
      copyButton.disabled = false;
    }, 1500);
  };
}

export function initMatcher() {
  const hexInput = document.getElementById("matcher-hex-input");
  const colorPicker = document.getElementById("matcher-color-picker");
  const errorEl = document.getElementById("matcher-error");
  const inputSwatch = document.getElementById("matcher-input-swatch");
  const inputHexLabel = document.getElementById("matcher-input-hex-label");
  const inputCopyButton = document.getElementById("matcher-input-copy");
  const match2 = document.getElementById("matcher-match-2");

  let currentInputHex = "";

  inputCopyButton.addEventListener("click", async () => {
    await copyToClipboard(currentInputHex);
    const original = inputCopyButton.textContent;
    inputCopyButton.textContent = "Copied!";
    inputCopyButton.disabled = true;
    setTimeout(() => {
      inputCopyButton.textContent = original;
      inputCopyButton.disabled = false;
    }, 1500);
  });

  function renderResults(hex) {
    const canonicalHex = rgbToHex(hexToRgb(hex));
    currentInputHex = canonicalHex;
    inputSwatch.style.backgroundColor = canonicalHex;
    inputHexLabel.textContent = canonicalHex.toUpperCase();
    colorPicker.value = canonicalHex;

    const matches = findClosestMatches(canonicalHex);
    renderMatchCard(1, matches[0]);
    match2.classList.toggle("hidden", matches.length < 2);
    if (matches.length > 1) {
      renderMatchCard(2, matches[1]);
    }
  }

  function handleHexInput() {
    const raw = hexInput.value.trim();
    if (raw === "") {
      errorEl.classList.add("hidden");
      return;
    }
    if (!isValidHex(raw)) {
      errorEl.classList.remove("hidden");
      return;
    }
    errorEl.classList.add("hidden");
    renderResults(raw.startsWith("#") ? raw : `#${raw}`);
  }

  hexInput.addEventListener("input", handleHexInput);
  colorPicker.addEventListener("input", () => {
    hexInput.value = colorPicker.value;
    handleHexInput();
  });

  hexInput.value = "#1db954";
  handleHexInput();
}
