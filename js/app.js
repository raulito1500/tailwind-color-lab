import { initComparator } from "./comparator.js";

const tabButtons = document.querySelectorAll(".tab-button");

function activateTab(name) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === name;
    button.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `panel-${name}`);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
});

initComparator();
