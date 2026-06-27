# Squish

Compress any image to an **exact file size** — right in the browser. No uploads,
no servers, no waiting. Type a target like `2 MB` and Squish trims quality and
resolution until your image fits under it.

Built with **React + Vite + Tailwind CSS** and
[`browser-image-compression`](https://www.npmjs.com/package/browser-image-compression).

---

## Features

- Drag-and-drop **and** click-to-browse upload
- Set an exact target size in MB (defaults to 2 MB)
- Original vs. compressed previews with a **drag-to-compare** slider
- Live original size, compressed size, and savings %
- Friendly errors for unsupported files
- Loading / progress state while compressing
- 100% client-side — **images never leave your device**
- Fully responsive, keyboard-accessible, respects reduced-motion

---

## Getting started

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install      # 1. install dependencies
npm run dev      # 2. start dev server at http://localhost:5173
npm run build    # 3. build for production (outputs to /dist)
npm run preview  # 4. preview the production build locally
```

---

## Project structure

```
squish/
├── public/
│   └── favicon.svg            # browser tab icon
├── src/
│   ├── components/
│   │   ├── icons.jsx          # inline SVG icon set (no icon library)
│   │   ├── Header.jsx         # top nav bar
│   │   ├── Hero.jsx           # headline + the compressor tool
│   │   ├── Compressor.jsx     # main stateful tool (upload -> target -> result)
│   │   ├── Dropzone.jsx       # drag-and-drop + file picker
│   │   ├── ResultPreview.jsx  # stats, savings meter, download
│   │   ├── CompareSlider.jsx  # draggable before/after comparison
│   │   ├── Features.jsx       # "why Squish" cards
│   │   ├── HowItWorks.jsx     # 3-step explainer
│   │   ├── FAQ.jsx            # accordion
│   │   └── Footer.jsx
│   ├── utils/
│   │   ├── compress.js        # validation + browser-image-compression wrapper
│   │   └── format.js          # bytes / % / dimensions helpers
│   ├── App.jsx                # assembles all sections
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind + fonts + base styles
├── index.html                 # HTML shell
├── tailwind.config.js         # design tokens (colors, fonts, shadows)
├── postcss.config.js
├── vite.config.js
├── netlify.toml               # Netlify build + SPA redirect config
└── package.json
```

---
