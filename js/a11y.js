import { TAILWIND_COLORS } from "./colors.js";
import { hexToRgb, contrastRatio, capitalize, populateSelect } from "./utils.js";

const FAMILIES = Object.keys(TAILWIND_COLORS);
const SHADES = Object.keys(TAILWIND_COLORS.slate).map(Number);

const PASS_CLASSES =
  "inline-block rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700";
const FAIL_CLASSES =
  "inline-block rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700";

function wireSelectPair(prefix, defaults, onChange) {
  const familySelect = document.getElementById(`a11y-${prefix}-family`);
  const shadeSelect = document.getElementById(`a11y-${prefix}-shade`);

  populateSelect(familySelect, FAMILIES, capitalize);
  populateSelect(shadeSelect, SHADES);
  familySelect.value = defaults.family;
  shadeSelect.value = String(defaults.shade);

  familySelect.addEventListener("change", onChange);
  shadeSelect.addEventListener("change", onChange);

  return () => TAILWIND_COLORS[familySelect.value][shadeSelect.value].hex;
}

function setBadge(el, passed, label) {
  el.textContent = passed ? `${label} Pass` : `${label} Fail`;
  el.className = passed ? PASS_CLASSES : FAIL_CLASSES;
}

export function initA11yInspector() {
  const preview = document.getElementById("a11y-preview");
  const previewNormal = document.getElementById("a11y-preview-normal");
  const previewLarge = document.getElementById("a11y-preview-large");
  const ratioEl = document.getElementById("a11y-ratio");
  const badgeAaNormal = document.getElementById("a11y-badge-aa-normal");
  const badgeAaaNormal = document.getElementById("a11y-badge-aaa-normal");
  const badgeAaLarge = document.getElementById("a11y-badge-aa-large");
  const badgeAaaLarge = document.getElementById("a11y-badge-aaa-large");

  function update() {
    const bgHex = getBg();
    const textHex = getText();

    preview.style.backgroundColor = bgHex;
    previewNormal.style.color = textHex;
    previewLarge.style.color = textHex;

    const ratio = contrastRatio(hexToRgb(bgHex), hexToRgb(textHex));
    ratioEl.textContent = `${ratio.toFixed(2)}:1`;

    setBadge(badgeAaNormal, ratio >= 4.5, "AA");
    setBadge(badgeAaaNormal, ratio >= 7, "AAA");
    setBadge(badgeAaLarge, ratio >= 3, "AA");
    setBadge(badgeAaaLarge, ratio >= 4.5, "AAA");
  }

  const getBg = wireSelectPair("bg", { family: "zinc", shade: 900 }, update);
  const getText = wireSelectPair("text", { family: "zinc", shade: 50 }, update);

  update();
}
