# Squish — Claude Code Context

## What this project is
A 100% client-side image compressor built with React + Vite + Tailwind CSS.
Users set a target file size in MB; the app iteratively compresses the image
until it lands under that number. Nothing is ever uploaded to a server.

Live site: https://squishh.netlify.app
GitHub: maqbool-dev/squish
Docker Hub: maqbool404/squish

---

## Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Framework   | React 19                                |
| Build tool  | Vite 8                                  |
| Styling     | Tailwind CSS 3                          |
| Compression | browser-image-compression ^2.0.2        |
| Hosting     | Netlify (CI/CD via GitHub — auto-deploy on push) |
| Container   | Docker Hub maqbool404/squish (manual build + push) |
| Runtime     | Node.js via Homebrew, Mac Apple Silicon |

---

## Project structure

```
squish/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── icons.jsx          # All inline SVG icons — no icon library
│   │   ├── Header.jsx         # Sticky nav bar
│   │   ├── Hero.jsx           # Headline + embeds the Compressor tool
│   │   ├── Compressor.jsx     # Main stateful component (upload → compress → result)
│   │   ├── Dropzone.jsx       # Drag-and-drop + file picker UI
│   │   ├── ResultPreview.jsx  # Stats, savings meter, download button
│   │   ├── CompareSlider.jsx  # Draggable before/after comparison
│   │   ├── Features.jsx       # "Why Squish" feature cards
│   │   ├── HowItWorks.jsx     # 3-step explainer section
│   │   ├── FAQ.jsx            # Accordion FAQ
│   │   └── Footer.jsx
│   ├── utils/
│   │   ├── compress.js        # Validates file + wraps browser-image-compression
│   │   └── format.js          # formatBytes(), formatDims(), formatSavings()
│   ├── App.jsx                # Assembles all sections in order
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind directives + Google Fonts import
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── netlify.toml               # build: npm run build, publish: dist
├── CLAUDE.md                  # You are here
└── package.json
```

---

## Design system — do not change these

### Colors
All colors are defined as Tailwind tokens in `tailwind.config.js` AND as
inline constants in components. Keep them in sync if you ever edit one.

| Token       | Hex       | Usage                              |
|-------------|-----------|------------------------------------|
| paper       | #F6F5EF   | Page background                    |
| surface     | #FFFFFF   | Card / panel backgrounds           |
| ink         | #15160F   | Primary text, buttons              |
| muted       | #6E6E64   | Secondary text, labels             |
| line        | #E6E4DA   | Borders, dividers                  |
| leaf        | #16A34A   | Primary accent (green)             |
| leafSoft    | #E7F6EC   | Green tinted backgrounds           |
| amber       | #C2772E   | Warning / error states             |
| amberSoft   | #F7EEDF   | Warning background tint            |

### Typography
| Role     | Font               | Usage                              |
|----------|--------------------|----------------------------------  |
| display  | Bricolage Grotesque| All headings (h1, h2, h3, feature titles) |
| body     | Inter              | Paragraphs, general UI text        |
| mono     | JetBrains Mono     | All numbers, file sizes, stats, labels, badges |

**Rule:** any number, measurement, percentage, or filename shown to the user
must use JetBrains Mono. Never use Inter for numerical data.

### Border radius
Cards and panels use `borderRadius: 20` (inline) or `rounded-xl` (Tailwind).
Buttons use `rounded-full`. Do not introduce other radius values.

### Shadows
Two shadow levels defined in `tailwind.config.js`:
- `shadow-card` — default card elevation
- `shadow-lift` — hover / draggable elements (e.g. compare slider handle)

---

## Core rules — never break these

1. **No server calls.** Compression is entirely in the browser via
   `browser-image-compression`. Do not add fetch/axios/API calls for
   image processing under any circumstances.

2. **Accepted input types:** `image/jpeg`, `image/png`, `image/webp` only.
   HEIC/HEIF conversion is a planned feature — do not add it unless
   specifically asked.

3. **Max upload size:** 50 MB hard limit enforced in `compress.js`.

4. **Default target size:** 2 MB.

5. **Error messages** must be user-friendly plain English — no stack traces,
   no technical jargon shown in the UI. Errors appear in the amber
   warning style (border `amber + 33` opacity, background `amberSoft`).

6. **No icon libraries.** All icons are hand-written inline SVGs in
   `icons.jsx`. Add new icons there in the same style.

7. **Do not change fonts or colors.** The warm paper + green accent
   visual identity is intentional. Do not substitute system fonts or
   introduce new accent colors.

---

## Known issues

### Mobile compression error (Android)
- Some Android users hit a compression failure, exact error unknown
- Hypothesis A: Vite JS chunk fails to load on weak networks, leaving
  the compression worker undefined when the user tries to compress
- Hypothesis B: Large images exceed Android Chrome's canvas memory limit
- Status: unconfirmed — need to capture the real error from console.error
- Do not assume HEIC is the cause; this user is on Android

---

## Planned features (not yet implemented)

- [ ] Capture and log the real mobile error to diagnose the Android bug
- [ ] Add a compression timeout (30s) with a user-friendly message
- [ ] HEIC/HEIF input support using `heic2any` (client-side conversion)
- [ ] Output format selector (keep original / JPEG / PNG / WebP)

---

## Deployment

### Netlify (primary — auto-deploys)
```bash
git add .
git commit -m "your message"
git push origin main
# Netlify picks it up automatically via the GitHub integration
```

### Docker Hub (manual)
```bash
docker build -t maqbool404/squish .
docker push maqbool404/squish
```

### Local dev
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs to /dist
npm run preview   # preview the production build locally
```

---

## What Claude Code should know about working in this repo

- Always run `npm run build` after making changes to verify no build errors
- If you edit `tailwind.config.js` color tokens, also update the `C` object
  in any component that uses inline color constants (Compressor.jsx, etc.)
- The compare slider (`CompareSlider.jsx`) uses pointer events — test on
  both mouse and touch when changing it
- `compress.js` is the most critical file — be conservative with changes
  and always preserve the client-side-only constraint
- Prefer editing existing components over creating new ones unless the
  feature clearly warrants a new file
