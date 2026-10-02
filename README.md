<div align="center">

# ZJTable

**Turn any JSON into a beautiful table.**

A lightweight Chrome extension by **Zenit Software Group** that renders JSON data as a clean, interactive, Excel-style table — with cascading filters, field-targeted search, nested support, and resizable columns.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8.svg)](https://tailwindcss.com/)

---
[Demo](./live.webm)

---

### 🔗 [Live Preview (Web Version)](https://amirho3einShaker.github.io/ZJTable/) · 📦 [Download Chrome Extension](https://github.com/amirho3einShaker/ZJTable/releases/latest)

</div>

---

## Features

- **Multi-source input**
  - Upload a local `.json` file
  - Extract JSON from the active browser tab (whole-page JSON or `<script type="application/json">` / `ld+json`)
  - Paste JSON directly from the clipboard via a built-in modal
- **Interactive table**
  - Nested objects and arrays rendered as expandable sub-tables
  - Excel-style column resizing (drag the column edge)
  - Click any cell to expand long text
  - Auto-detect plain primitive arrays and render them as a single `value` column
- **Cascading column filter**
  - Checkbox tree with parent/child sync
  - Indeterminate state on parent nodes
  - Invert and reset options
  - Badge counter showing hidden columns
- **Field-targeted search**
  - Choose exactly which columns to search in
  - Instant result count with "nothing found" feedback
  - Search works across nested objects and arrays
- **Clean UI**
  - Excel-inspired green theme (`#107c41`)
  - Light, minimal, distraction-free design
  - Standalone popup window sized to your display

---

## Installation

### From source (development)

```bash
# 1. Clone the repository
git clone https://github.com/amirho3einShaker/ZJTable.git
cd ZJTable

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build
```

Then load the extension in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder inside the project

### Dev mode

```bash
npm run dev
```

Runs a local Vite dev server. Chrome extension APIs (`chrome.tabs`, `chrome.scripting`) are **not** available in the dev server — use `npm run build` + Load unpacked to test the extension itself.

---

## Download

### 🌐 Web Version (Preview)

Try ZJTable directly in your browser — no installation required:

**→ [https://amirho3einShaker.github.io/ZJTable/](https://amirho3einShaker.github.io/ZJTable/)**

> **Note:** The web version supports **Upload JSON File** and **Paste JSON from Clipboard**. The "Show JSON of This Page" feature is only available in the Chrome extension.

### 📦 Chrome Extension

Download the latest release directly from GitHub:

**→ [Latest Release](https://github.com/amirho3einShaker/ZJTable/releases/latest)**

1. Go to the [Releases page](https://github.com/amirho3einShaker/ZJTable/releases/latest)
2. Download the latest `ZJTable-vX.X.X.zip` file
3. Extract the ZIP to a folder
4. Open `chrome://extensions/` in Chrome
5. Enable **Developer mode** (top-right corner)
6. Click **Load unpacked** and select the extracted folder

---

## Usage

1. Click the **ZJTable** icon in the Chrome toolbar.
2. A standalone popup opens, sized to your screen.
3. Pick a data source:
   - **Show JSON of This Page** — extracts JSON from the current tab _(extension only)_
   - **Upload JSON File** — select a local `.json` file
   - **Paste JSON from Clipboard** — paste raw JSON text
4. Use the toolbar to:
   - **Filter** — show/hide columns (cascading tree with search)
   - **Search** — pick fields and query for values
5. Click any cell to expand it, or drag column edges to resize.

> **Web build:** When deployed to GitHub Pages, the extension-only "Show JSON of This Page" button is hidden automatically. Use Upload or Paste instead.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) |
| Build tool | [Vite 6](https://vitejs.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Extension | Chrome Manifest V3 |
| Language | JavaScript (ES modules) |

---

## Project Structure

```
ZJTable/
├── public/                     # Static assets copied as-is to build output
│   ├── assets/                 # Logo and other public assets
│   ├── Icons/                  # Extension icons (16, 48, 128)
│   ├── background.js           # Chrome service worker
│   ├── data.json               # Sample data for local development
│   └── manifest.json           # Extension manifest (MV3)
├── src/
│   ├── assets/
│   │   └── css/
│   │       ├── main.css        # Tailwind + global resets
│   │       ├── home.css        # Home page + paste modal
│   │       └── table.css       # Excel-style table styling
│   ├── components/
│   │   ├── filter.vue          # Cascading column filter modal
│   │   ├── footer.vue          # Credits footer
│   │   ├── header.vue          # Top bar with filter + search + logo
│   │   ├── search.vue          # Field-targeted search box
│   │   ├── table.vue           # Recursive JSON table renderer
│   │   └── TreeNode.vue        # Recursive tree node (filter/search)
│   ├── layouts/
│   │   └── DefaultLayout.vue   # Header + slot + footer shell
│   ├── pages/
│   │   └── index.vue           # Main page (home / pick / table)
│   ├── App.vue                 # Root component (state owner)
│   └── main.js                 # Entry point
├── LICENSE
├── README.md
├── package.json
└── vite.config.ts
```

---

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the extension to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Main Contributors

- **AmirHossein Shaker** — Development · [@amirho3einShaker](https://github.com/amirho3einShaker)
- **Aboulfazl Cheloyi** — Concept & Idea · [@cheloei](https://github.com/cheloei)

**Developed at** [Zenit Software Group](https://zenit-tm.ir)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with 💚 by **Zenit Software Group**

</div>
