# Tailwind Color Lab

[![Deploy to GitHub Pages](https://github.com/raulito1500/tailwind-color-lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/raulito1500/tailwind-color-lab/actions/workflows/deploy.yml)

**[Live demo →](https://raulito1500.github.io/tailwind-color-lab/)**

A vanilla JS toolkit for working with the Tailwind CSS color system: match any color to its closest Tailwind class, compare shades side by side, generate a full 50–950 scale from a brand color, and check WCAG contrast — all in one place.

## Why

Designers hand off arbitrary hex codes; developers need the closest Tailwind class. Picking a shade often means eyeballing two similar grays, or guessing whether a text/background combination is accessible. Tailwind Color Lab bundles the four checks a Tailwind-based UI workflow actually needs, instead of switching between four different single-purpose sites.

## Tools

- **Color Comparator** — place any two Tailwind shades side by side to compare hue, saturation and lightness.
- **Color Matcher** — paste a hex/RGB value and get the closest official Tailwind class, ranked by perceptual (CIELAB ΔE) distance.
- **Scale Generator** — turn one brand hex into a full 50–950 Tailwind-style scale, exportable as a ready-to-paste `@theme` CSS snippet.
- **A11y Inspector** — check any foreground/background pair against WCAG 2.1 AA/AAA contrast thresholds, with a live text preview.

## Tech stack & performance

- **Zero frameworks, zero runtime dependencies.** No React, no Vue, no jQuery — plain DOM APIs and native ES modules.
- **Tailwind CSS** is the only build-time dependency (`devDependency`), compiled locally with the Tailwind CLI and purged for production.
- Fonts (Space Grotesk, Inter) are self-hosted `woff2` files — no external font requests at runtime.
- Deployed as a fully static site to GitHub Pages via GitHub Actions on every push to `main`.

## Getting started

```bash
git clone https://github.com/raulito1500/tailwind-color-lab.git
cd tailwind-color-lab
npm install
npm run build   # compiles css/tailwind.css
```

Then open `index.html` directly in a browser, or serve the folder with any static server (e.g. the VS Code Live Preview extension, or `npx serve`).

While making CSS changes, run `npm run watch` to rebuild `css/tailwind.css` on save.

## Contributing

This is a plain HTML/CSS/JS project — no bundler, no build step beyond Tailwind CSS itself. Fork it, edit the files, and open a PR.

## License

[MIT](LICENSE)
