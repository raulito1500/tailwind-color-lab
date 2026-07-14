import { initComparator } from "./comparator.js";
import { initMatcher } from "./matcher.js";
import { initScaleGenerator } from "./scale.js";

const tabButtons = document.querySelectorAll(".tab-button");
const TAB_NAMES = Array.from(tabButtons, (button) => button.dataset.tab);
const DEFAULT_TAB = TAB_NAMES[0];

function showTab(name) {
  const active = TAB_NAMES.includes(name) ? name : DEFAULT_TAB;

  tabButtons.forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.tab === active));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `panel-${active}`);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    location.hash = button.dataset.tab;
  });
});

window.addEventListener("hashchange", () => {
  showTab(location.hash.slice(1));
});

showTab(location.hash.slice(1) || DEFAULT_TAB);

initComparator();
initMatcher();
initScaleGenerator();
