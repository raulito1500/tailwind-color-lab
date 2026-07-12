import { TAILWIND_COLORS } from "./colors.js";
import { hexToRgb, rgbToHsl, rgbToOklch, copyToClipboard } from "./utils.js";

const FAMILIES = Object.keys(TAILWIND_COLORS);
const SHADES = Object.keys(TAILWIND_COLORS.slate).map(Number);

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function populateSelect(select, values, formatLabel) {
  select.innerHTML = "";
  for (const value of values) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = formatLabel ? formatLabel(value) : String(value);
    select.append(option);
  }
}

function initCard(suffix, defaults) {
  const familySelect = document.getElementById(`comparator-${suffix}-family`);
  const shadeSelect = document.getElementById(`comparator-${suffix}-shade`);
  const swatch = document.getElementById(`comparator-${suffix}-swatch`);
  const classEl = document.getElementById(`comparator-${suffix}-class`);
  const hexEl = document.getElementById(`comparator-${suffix}-hex`);
  const rgbEl = document.getElementById(`comparator-${suffix}-rgb`);
  const hslEl = document.getElementById(`comparator-${suffix}-hsl`);
  const oklchEl = document.getElementById(`comparator-${suffix}-oklch`);
  const copyButton = document.getElementById(`comparator-${suffix}-copy`);

  populateSelect(familySelect, FAMILIES, capitalize);
  populateSelect(shadeSelect, SHADES);
  familySelect.value = defaults.family;
  shadeSelect.value = String(defaults.shade);

  let currentClassName = "";

  function render() {
    const family = familySelect.value;
    const shade = shadeSelect.value;
    const hex = TAILWIND_COLORS[family][shade];
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const oklch = rgbToOklch(rgb);

    currentClassName = `bg-${family}-${shade}`;
    swatch.style.backgroundColor = hex;
    classEl.textContent = currentClassName;
    hexEl.textContent = hex.toUpperCase();
    rgbEl.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslEl.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    oklchEl.textContent = `oklch(${oklch.l}% ${oklch.c} ${oklch.h})`;
  }

  familySelect.addEventListener("change", render);
  shadeSelect.addEventListener("change", render);

  copyButton.addEventListener("click", async () => {
    await copyToClipboard(currentClassName);
    const original = copyButton.textContent;
    copyButton.textContent = "Copied!";
    copyButton.disabled = true;
    setTimeout(() => {
      copyButton.textContent = original;
      copyButton.disabled = false;
    }, 1500);
  });

  render();
}

export function initComparator() {
  initCard("a", { family: "amber", shade: 500 });
  initCard("b", { family: "orange", shade: 600 });
}
