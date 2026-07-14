import { TAILWIND_COLORS } from "./colors.js";
import {
  hexToRgb,
  rgbToHex,
  rgbToOklch,
  cssColorToHex,
  isValidHex,
  copyToClipboard,
} from "./utils.js";

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Families with negligible chroma (true grays) would distort a chroma *ratio*
// curve, since dividing by a near-zero base chroma blows up — only the
// visibly-colored families are used to learn the saturation shape.
const CHROMATIC_FAMILIES = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
  "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
];

function parseOklch(str) {
  const [, l, c, h] = str.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);
  return { l: parseFloat(l), c: parseFloat(c), h: parseFloat(h) };
}

// Learns how lightness and chroma typically move across the 50-950 range,
// relative to each family's own 500 shade, by averaging every real Tailwind
// v4 family in colors.js. Applying that relative shape to an arbitrary input
// color (anchored at 500) produces a scale that keeps Tailwind's own rhythm.
function computeShadeCurve() {
  const allFamilies = Object.keys(TAILWIND_COLORS);
  const curve = {};
  for (const shade of SHADES) curve[shade] = { lOffset: 0, cRatio: 0 };

  for (const family of allFamilies) {
    const base = parseOklch(TAILWIND_COLORS[family][500].oklch);
    for (const shade of SHADES) {
      curve[shade].lOffset += parseOklch(TAILWIND_COLORS[family][shade].oklch).l - base.l;
    }
  }

  for (const family of CHROMATIC_FAMILIES) {
    const base = parseOklch(TAILWIND_COLORS[family][500].oklch);
    for (const shade of SHADES) {
      curve[shade].cRatio += parseOklch(TAILWIND_COLORS[family][shade].oklch).c / base.c;
    }
  }

  for (const shade of SHADES) {
    curve[shade].lOffset /= allFamilies.length;
    curve[shade].cRatio /= CHROMATIC_FAMILIES.length;
  }
  return curve;
}

const SHADE_CURVE = computeShadeCurve();

function generateScale(baseHex) {
  const base = rgbToOklch(hexToRgb(baseHex));
  const scale = {};
  for (const shade of SHADES) {
    const { lOffset, cRatio } = SHADE_CURVE[shade];
    const l = Math.min(100, Math.max(0, base.l + lOffset));
    const c = Math.max(0, base.c * cRatio);
    const oklch = `oklch(${l.toFixed(1)}% ${c.toFixed(3)} ${base.h.toFixed(1)})`;
    scale[shade] = { hex: cssColorToHex(oklch), oklch };
  }
  return scale;
}

function sanitizeName(raw) {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "brand";
}

function buildThemeSnippet(name, scale) {
  const lines = ["@theme {"];
  for (const shade of SHADES) {
    lines.push(`  --color-${name}-${shade}: ${scale[shade].oklch};`);
  }
  lines.push("}");
  return lines.join("\n");
}

export function initScaleGenerator() {
  const hexInput = document.getElementById("scale-hex-input");
  const colorPicker = document.getElementById("scale-color-picker");
  const nameInput = document.getElementById("scale-name-input");
  const errorEl = document.getElementById("scale-error");
  const grid = document.getElementById("scale-grid");
  const snippetCode = document.querySelector("#scale-snippet code");
  const copySnippetButton = document.getElementById("scale-copy-snippet");

  function renderGrid(scale) {
    grid.innerHTML = "";
    for (const shade of SHADES) {
      const { hex } = scale[shade];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scale-swatch";
      button.innerHTML = `
        <span class="scale-swatch-color" style="background-color: ${hex}"></span>
        <span class="scale-swatch-meta">
          <span>${shade}</span>
          <span>${hex.toUpperCase()}</span>
        </span>
      `;
      button.addEventListener("click", async () => {
        await copyToClipboard(hex.toUpperCase());
        const meta = button.querySelector(".scale-swatch-meta");
        const original = meta.innerHTML;
        meta.innerHTML = "<span>Copied!</span>";
        setTimeout(() => {
          meta.innerHTML = original;
        }, 1200);
      });
      grid.append(button);
    }
  }

  function render() {
    const rawHex = hexInput.value.trim();
    if (!isValidHex(rawHex)) return;
    const canonicalHex = rgbToHex(hexToRgb(rawHex.startsWith("#") ? rawHex : `#${rawHex}`));
    colorPicker.value = canonicalHex;

    const scale = generateScale(canonicalHex);
    renderGrid(scale);
    snippetCode.textContent = buildThemeSnippet(sanitizeName(nameInput.value), scale);
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
    render();
  }

  hexInput.addEventListener("input", handleHexInput);
  colorPicker.addEventListener("input", () => {
    hexInput.value = colorPicker.value;
    handleHexInput();
  });
  nameInput.addEventListener("input", render);

  copySnippetButton.addEventListener("click", async () => {
    await copyToClipboard(snippetCode.textContent);
    const original = copySnippetButton.textContent;
    copySnippetButton.textContent = "Copied!";
    setTimeout(() => {
      copySnippetButton.textContent = original;
    }, 1500);
  });

  hexInput.value = "#9929bd";
  handleHexInput();
}
