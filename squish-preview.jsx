import React, { useState, useRef, useEffect, useCallback } from "react";

// ── Live preview note ───────────────────────────────────────────────
// This single-file version uses the browser's native Canvas API for
// compression so it runs in the preview sandbox. The downloadable
// project uses the `browser-image-compression` library (same idea,
// more robust). The UI/UX is identical.
// ────────────────────────────────────────────────────────────────────

const C = {
  paper: "#F6F5EF",
  surface: "#FFFFFF",
  ink: "#15160F",
  muted: "#6E6E64",
  line: "#E6E4DA",
  leaf: "#16A34A",
  leafSoft: "#E7F6EC",
  amber: "#C2772E",
  amberSoft: "#F7EEDF",
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function formatBytes(b) {
  if (b == null) return "—";
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 2 : 1)} MB`;
}

// Two-phase canvas compression, able to hit aggressive targets like 100 KB.
//   Phase 1 — drop quality at full resolution (skipped for lossless PNG).
//   Phase 2 — scale the ORIGINAL dimensions down at minimum quality.
// Each phase stops early the moment the result fits under the target.
async function compressCanvas(file, targetBytes, onProgress) {
  const isPng = file.type === "image/png";
  const outType = isPng ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
  const bmp = await createImageBitmap(file);
  const baseW = bmp.width;
  const baseH = bmp.height;

  // Quality ramps all the way down to 0.05 — not 0.4 — and does NOT reset
  // when we move into the dimension phase (it stays at minQ). PNG is lossless,
  // so it gets no quality phase at all.
  const qualitySteps = isPng ? [] : [0.92, 0.80, 0.65, 0.50, 0.35, 0.20, 0.10, 0.05];

  // For PNG, jump straight to roughly the right scale instead of stepping
  // through 8 sizes: estimate from the target/source ratio (≈0.6 B/px), then
  // probe a few scales bracketing it. Cuts worst-case PNG encodes from 8 → ≤4.
  let dimScales;
  if (isPng) {
    const est = Math.min(1, Math.max(0.05, Math.sqrt(targetBytes / (file.size * 0.6))));
    dimScales = [...new Set(
      [est * 1.4, est * 1.1, est, est * 0.75].map((s) => Math.min(1, Math.max(0.05, s)))
    )];
  } else {
    dimScales = [0.80, 0.65, 0.50, 0.40, 0.30, 0.20, 0.15, 0.10];
  }

  const totalSteps = qualitySteps.length + dimScales.length;
  let stepsDone = 0;
  let best = null;

  const draw = (w, h) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w));
    canvas.height = Math.max(1, Math.round(h));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return canvas;
  };
  const toBlob = (canvas, q) => new Promise((res) => canvas.toBlob(res, outType, q));
  const bump = () => { stepsDone++; onProgress(Math.round((stepsDone / totalSteps) * 100)); };
  const consider = (blob) => { if (blob && (!best || blob.size < best.size)) best = blob; };
  const finalize = () => {
    onProgress(100);
    const name = file.name.replace(/\.(jpe?g|png|webp)$/i, "");
    const ext = outType === "image/png" ? "png" : outType === "image/webp" ? "webp" : "jpg";
    return new File([best], `${name}-squished.${ext}`, { type: outType });
  };

  // ── Phase 1: quality reduction at full resolution ──
  // (qualitySteps is empty for PNG, so this loop is a no-op there.)
  for (const q of qualitySteps) {
    const blob = await toBlob(draw(baseW, baseH), q);
    bump();
    consider(blob);
    if (blob && blob.size <= targetBytes) return finalize();
  }

  // ── Phase 2: dimension reduction at minimum quality ──
  // Scales apply to the ORIGINAL dimensions; quality stays pinned at minQ.
  const minQ = isPng ? undefined : 0.05;
  for (const scale of dimScales) {
    const blob = await toBlob(draw(baseW * scale, baseH * scale), minQ);
    bump();
    consider(blob);
    if (blob && blob.size <= targetBytes) return finalize();
  }

  return finalize();
}

function readDims(file) {
  return new Promise((res) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { res({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { res({ width: 0, height: 0 }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

// ── Icons ──
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
const Logo = ({ s = 28 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" fill={C.leaf} />
    <path d="M8 14.5 10.5 12 13 14l3-3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="8.5" r="1.4" fill="#fff" />
  </svg>
);
const IUpload = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><path d="M12 16V9m0 0-3 3m3-3 3 3" /><path d="M6.5 19a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 1 6.86" /></svg>;
const IDownload = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><path d="M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5" /><path d="M5 18.5h14" /></svg>;
const ILock = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><rect x="5" y="10.5" width="14" height="9" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>;
const IGauge = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><path d="M5 16a7 7 0 1 1 14 0" /><path d="M12 16l3.5-3.5" /></svg>;
const IResize = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><path d="M9 4H5a1 1 0 0 0-1 1v4m11-5h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4m11 5h4a1 1 0 0 0 1-1v-4" /></svg>;
const IChevron = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><path d="m6 9 6 6 6-6" /></svg>;
const ICheck = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><path d="m5 12.5 4.5 4.5L19 7" /></svg>;
const IWarn = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><path d="M12 8.5v4.5m0 3h.01" /><path d="M10.3 4.2 3.5 16a2 2 0 0 0 1.7 3h13.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /></svg>;
const IX = (p) => <svg viewBox="0 0 24 24" {...stroke} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
const ISpin = (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;

// ── Compare slider ──
function CompareSlider({ originalUrl, compressedUrl, dims }) {
  const wrap = useRef(null);
  const [pos, setPos] = useState(55);
  const [active, setActive] = useState(false);
  const move = useCallback((x) => {
    const el = wrap.current; if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  }, []);
  useEffect(() => {
    if (!active) return;
    const m = (e) => move(e.touches ? e.touches[0].clientX : e.clientX);
    const s = () => setActive(false);
    window.addEventListener("mousemove", m); window.addEventListener("touchmove", m);
    window.addEventListener("mouseup", s); window.addEventListener("touchend", s);
    return () => { window.removeEventListener("mousemove", m); window.removeEventListener("touchmove", m); window.removeEventListener("mouseup", s); window.removeEventListener("touchend", s); };
  }, [active, move]);
  return (
    <div>
      <div ref={wrap} className="relative w-full select-none overflow-hidden rounded-xl" style={{ aspectRatio: "4/3", background: "rgba(21,22,15,0.06)" }}>
        <img src={originalUrl} alt="Original" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={compressedUrl} alt="Compressed" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        </div>
        <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-white" style={{ background: "rgba(21,22,15,0.75)", fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" }}>Original</span>
        <span className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-white" style={{ background: C.leaf, fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" }}>Compressed</span>
        <div className="absolute inset-y-0 z-10 flex items-center justify-center" style={{ left: `${pos}%`, width: 2, background: "#fff", boxShadow: "0 0 0 1px rgba(21,22,15,0.15)" }}>
          <button type="button" aria-label="Drag to compare" onMouseDown={() => setActive(true)} onTouchStart={() => setActive(true)}
            className="grid place-items-center rounded-full" style={{ height: 36, width: 36, transform: "translateX(-50%)", cursor: "ew-resize", border: `1px solid ${C.line}`, background: "#fff", color: C.ink, boxShadow: "0 2px 4px rgba(21,22,15,0.05),0 24px 48px -16px rgba(21,22,15,0.18)" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 7-4 5 4 5M15 7l4 5-4 5" /></svg>
          </button>
        </div>
      </div>
      <p className="mt-2 text-center" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: C.muted }}>Drag the handle to compare · {dims}</p>
    </div>
  );
}

// ── Compressor ──
function Compressor() {
  const [original, setOriginal] = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [targetMB, setTargetMB] = useState(2);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    setError(""); setCompressed(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) { setError("That file type isn't supported. Please use JPG, PNG, or WebP."); setStatus("error"); setOriginal(null); return; }
    if (file.size > 50 * 1024 * 1024) { setError("That image is over 50 MB. Please pick a smaller file."); setStatus("error"); setOriginal(null); return; }
    const dimensions = await readDims(file);
    setOriginal({ file, url: URL.createObjectURL(file), dimensions });
    setStatus("ready");
  }, []);

  async function compress() {
    if (!original) return;
    const t = Number(targetMB);
    if (!t || t <= 0) { setError("Enter a target size greater than 0 MB."); return; }
    setError(""); setStatus("working"); setProgress(0);
    try {
      const file = await compressCanvas(original.file, t * 1024 * 1024, setProgress);
      const dimensions = await readDims(file);
      setCompressed({ file, url: URL.createObjectURL(file), dimensions });
      setStatus("done");
    } catch (e) { setError("Something went wrong while compressing. Please try another image."); setStatus("error"); }
  }

  function reset() { setOriginal(null); setCompressed(null); setError(""); setProgress(0); setStatus("idle"); setTargetMB(2); }
  function download() {
    const url = URL.createObjectURL(compressed.file);
    const a = document.createElement("a"); a.href = url; a.download = compressed.file.name;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  const working = status === "working";
  const savings = original && compressed ? Math.max(0, Math.round(((original.file.size - compressed.file.size) / original.file.size) * 100)) : 0;
  const underTarget = compressed && compressed.file.size <= targetMB * 1024 * 1024;
  const mono = { fontFamily: "JetBrains Mono, monospace" };

  return (
    <div className="p-5 sm:p-6" style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.surface, boxShadow: "0 1px 2px rgba(21,22,15,0.04),0 12px 28px -12px rgba(21,22,15,0.12)" }}>
      <div className="mb-4 flex items-center justify-between">
        <h2 style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>Compress an image</h2>
        {original && <button onClick={reset} className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium" style={{ color: C.muted }}><IX width={16} height={16} /> Start over</button>}
      </div>

      {status !== "done" && (
        <button type="button" onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!working) setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (!working) handleFile(e.dataTransfer.files?.[0]); }}
          disabled={working}
          className="flex w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center"
          style={{ borderRadius: 20, border: `2px dashed ${drag ? C.leaf : C.line}`, background: drag ? C.leafSoft : "rgba(246,245,239,0.6)", cursor: working ? "not-allowed" : "pointer", transition: "all .2s" }}>
          <span className="grid place-items-center rounded-full" style={{ height: 48, width: 48, background: drag ? C.leaf : C.surface, color: drag ? "#fff" : C.ink, boxShadow: drag ? "none" : "0 1px 2px rgba(0,0,0,0.06)" }}><IUpload width={24} height={24} /></span>
          <span>
            <span className="block font-medium" style={{ color: C.ink }}>{drag ? "Drop to upload" : "Drag an image here"}</span>
            <span className="block text-sm" style={{ color: C.muted }}>or <span style={{ color: C.leaf, fontWeight: 500 }}>browse your files</span></span>
          </span>
          <span style={{ ...mono, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted }}>JPG, PNG, or WebP · up to 50 MB</span>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1}
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
        </button>
      )}

      {original && status !== "done" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl p-3" style={{ border: `1px solid ${C.line}`, background: "rgba(246,245,239,0.6)" }}>
          <img src={original.url} alt="" className="rounded-lg object-cover" style={{ height: 48, width: 48 }} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{original.file.name}</p>
            <p style={{ ...mono, fontSize: 12, color: C.muted }}>{formatBytes(original.file.size)} · {original.dimensions.width}×{original.dimensions.height}</p>
          </div>
        </div>
      )}

      {original && status !== "done" && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span style={{ ...mono, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted }}>Target size</span>
            <div className="mt-1.5 flex overflow-hidden rounded-xl" style={{ border: `1px solid ${C.line}`, background: "rgba(246,245,239,0.6)" }}>
              <input type="number" inputMode="decimal" min="0.05" step="0.1" value={targetMB} disabled={working}
                onChange={(e) => setTargetMB(e.target.value)} className="w-full bg-transparent px-4 py-3 outline-none" style={{ ...mono, fontSize: 18 }} />
              <span className="flex items-center px-4" style={{ ...mono, fontSize: 14, fontWeight: 500, color: C.muted, borderLeft: `1px solid ${C.line}`, background: C.surface }}>MB</span>
            </div>
          </label>
          <button type="button" onClick={compress} disabled={working} className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-medium"
            style={{ background: C.ink, color: C.paper, opacity: working ? 0.7 : 1, transition: "all .2s" }}>
            {working ? <><ISpin width={20} height={20} className="animate-spin" /> Compressing… {progress}%</> : <>Compress to {targetMB || "?"} MB</>}
          </button>
          {working && <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: C.line }}><div className="h-full rounded-full" style={{ width: `${progress}%`, background: C.leaf, transition: "width .3s" }} /></div>}
          <p className="flex items-center justify-center gap-1.5" style={{ ...mono, fontSize: 11, color: C.muted }}><ILock width={14} height={14} /> Processed in your browser — never uploaded</p>
        </div>
      )}

      {error && <div className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm" style={{ border: `1px solid ${C.amber}33`, background: C.amberSoft, color: C.amber }}><IWarn width={16} height={16} style={{ marginTop: 2, flexShrink: 0 }} /><span>{error}</span></div>}

      {status === "done" && compressed && original && (
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p style={{ ...mono, fontSize: 11, textTransform: "uppercase", letterSpacing: ".18em", color: C.muted }}>Result</p>
              <p style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 800, fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em", color: C.leaf, marginTop: 4 }}>−{savings}%</p>
              <p className="text-sm" style={{ color: C.muted, marginTop: 4 }}>smaller than the original</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: underTarget ? C.leafSoft : C.amberSoft, color: underTarget ? C.leaf : C.amber }}>
              <ICheck width={16} height={16} /> {underTarget ? `Under ${targetMB} MB` : "Smallest possible"}
            </div>
          </div>

          <div>
            <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ background: C.line }}>
              <div className="h-full rounded-full" style={{ width: `${Math.max(4, Math.round((compressed.file.size / original.file.size) * 100))}%`, background: C.leaf, transition: "width .7s ease-out" }} />
            </div>
            <div className="mt-1.5 flex justify-between" style={{ ...mono, fontSize: 11, color: C.muted }}><span>{formatBytes(compressed.file.size)}</span><span>{formatBytes(original.file.size)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Original" value={formatBytes(original.file.size)} sub={`${original.dimensions.width} × ${original.dimensions.height}`} />
            <Stat label="Compressed" value={formatBytes(compressed.file.size)} sub={`${compressed.dimensions.width} × ${compressed.dimensions.height}`} accent />
          </div>

          <CompareSlider originalUrl={original.url} compressedUrl={compressed.url} dims={`${compressed.dimensions.width} × ${compressed.dimensions.height}`} />

          <button type="button" onClick={download} className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-medium" style={{ background: C.ink, color: C.paper }}>
            <IDownload width={20} height={20} /> Download compressed image
          </button>
          <button type="button" onClick={reset} className="w-full rounded-full px-5 py-3 font-medium" style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.ink }}>Compress another image</button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  const mono = { fontFamily: "JetBrains Mono, monospace" };
  return (
    <div className="rounded-xl px-4 py-3" style={{ border: `1px solid ${accent ? C.leaf + "4d" : C.line}`, background: accent ? C.leafSoft + "80" : "rgba(246,245,239,0.6)" }}>
      <p style={{ ...mono, fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted }}>{label}</p>
      <p style={{ ...mono, fontSize: 18, fontWeight: 600, color: accent ? C.leaf : C.ink, marginTop: 2 }}>{value}</p>
      <p style={{ ...mono, fontSize: 11, color: C.muted }}>{sub} px</p>
    </div>
  );
}

// ── Sections ──
function Eyebrow({ children }) {
  return <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, textTransform: "uppercase", letterSpacing: ".18em", color: C.muted }}>{children}</p>;
}
function H2({ children }) {
  return <h2 className="mt-3 text-3xl sm:text-4xl" style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}>{children}</h2>;
}

function Features() {
  const items = [
    { Icon: IGauge, t: "Target-size control", b: "Type the ceiling you need — 500 KB, 2 MB, anything. Squish iterates until the file fits." },
    { Icon: IResize, t: "Smart resolution", b: "When quality alone won't get there, it scales dimensions down too — automatically, never upscaled." },
    { Icon: ILock, t: "Stays on your device", b: "Compression runs locally. Nothing is sent anywhere, ever." },
  ];
  return (
    <section id="features" className="py-16 sm:py-20" style={{ borderTop: `1px solid ${C.line}b3` }}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl"><Eyebrow>Why Squish</Eyebrow><H2>Precise where it counts, quiet everywhere else.</H2></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map(({ Icon, t, b }) => (
            <div key={t} className="p-6" style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.surface, boxShadow: "0 1px 2px rgba(21,22,15,0.04),0 12px 28px -12px rgba(21,22,15,0.12)" }}>
              <span className="grid place-items-center rounded-xl" style={{ height: 44, width: 44, background: C.leafSoft, color: C.leaf }}><Icon width={20} height={20} /></span>
              <h3 className="mt-4 text-lg" style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 700, letterSpacing: "-0.01em" }}>{t}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.muted }}>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload your image", b: "Drag a JPG, PNG, or WebP onto the tool, or browse for one. It loads instantly and stays local." },
    { n: "02", t: "Set your target size", b: "Enter the maximum size you need in megabytes. The default is 2 MB — change it to anything." },
    { n: "03", t: "Download the result", b: "Squish compresses, shows the savings, and lets you compare quality before you download." },
  ];
  return (
    <section id="how" className="py-16 sm:py-20" style={{ borderTop: `1px solid ${C.line}b3`, background: C.paper }}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl"><Eyebrow>How it works</Eyebrow><H2>Three steps, start to download.</H2></div>
        <ol className="mt-10 grid gap-px overflow-hidden sm:grid-cols-3" style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.line }}>
          {steps.map((s) => (
            <li key={s.n} className="p-6 sm:p-7" style={{ background: C.surface }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, fontWeight: 600, color: C.leaf }}>{s.n}</span>
              <h3 className="mt-3 text-lg" style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 700, letterSpacing: "-0.01em" }}>{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.muted }}>{s.b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Will my image be uploaded anywhere?", a: "No. Everything happens inside your browser tab. Your image is never sent to a server, which is why it works even offline once the page has loaded." },
    { q: "Which file types can I compress?", a: "JPG, PNG, and WebP. The output stays in the same format as your original so transparency and color are preserved where it matters." },
    { q: "What if my target size is too small?", a: "Squish compresses as far as it reasonably can. If it can't quite reach your number without destroying the image, it stops at the smallest sensible result and tells you." },
    { q: "Does compressing reduce the resolution?", a: "Only if it has to. It lowers quality first; if that's not enough to hit your target, it scales the dimensions down too. It never enlarges an image." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-16 sm:py-20" style={{ borderTop: `1px solid ${C.line}b3` }}>
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <div className="mb-10"><Eyebrow>FAQ</Eyebrow><H2>Good questions, honest answers.</H2></div>
        <div style={{ borderRadius: 20, border: `1px solid ${C.line}`, background: C.surface, overflow: "hidden" }}>
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} style={{ borderTop: i ? `1px solid ${C.line}` : "none" }}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left">
                  <span style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 600, letterSpacing: "-0.01em" }}>{item.q}</span>
                  <IChevron width={20} height={20} style={{ flexShrink: 0, color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .3s" }} />
                </button>
                <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0, transition: "all .3s" }}>
                  <div style={{ overflow: "hidden" }}><p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: C.muted }}>{item.a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  useEffect(() => {
    const id = "squish-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div style={{ background: C.paper, color: C.ink, fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ borderBottom: `1px solid ${C.line}b3`, background: "rgba(246,245,239,0.8)", backdropFilter: "blur(8px)" }}>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5"><Logo /><span style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}>Squish</span></a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" style={{ color: C.muted }}>
            <a href="#features">Features</a><a href="#how">How it works</a><a href="#faq">FAQ</a>
          </nav>
          <a href="#tool" className="rounded-full px-5 py-2 text-sm font-medium" style={{ background: C.ink, color: C.paper }}>Compress an image</a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: "0 0 auto 0", height: 420, zIndex: -1, background: `radial-gradient(60% 120% at 20% 0%, ${C.leafSoft} 0%, transparent 60%)` }} />
        <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 py-14 sm:px-8 lg:gap-14 lg:py-20" style={{ gridTemplateColumns: "1fr" }}>
          <div className="lg:grid lg:items-start lg:gap-14" style={{ gridTemplateColumns: "1.05fr 0.95fr" }}>
            <div className="max-w-xl">
              <Eyebrow>Image compressor · runs in your browser</Eyebrow>
              <h1 className="mt-4 text-5xl sm:text-6xl" style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.02em" }}>
                Hit any file size.<span style={{ display: "block", color: C.leaf }}>Down to the megabyte.</span>
              </h1>
              <p className="mt-5 text-lg leading-relaxed" style={{ color: C.muted }}>
                Name a number — say 2&nbsp;MB — and Squish keeps trimming quality and resolution until your image lands under it. No quality guesswork, no uploads, no waiting on a server.
              </p>
              <ul className="mt-7 space-y-2.5" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14 }}>
                {["Set an exact target in MB", "Watch it shrink, then download", "Compare quality before you commit"].map((line, i) => (
                  <li key={line} className="flex items-center gap-3">
                    <span className="grid place-items-center rounded-full" style={{ height: 20, width: 20, background: C.leafSoft, color: C.leaf, fontSize: 11, fontWeight: 600 }}>{i + 1}</span>{line}
                  </li>
                ))}
              </ul>
              <p className="mt-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium" style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.muted }}>
                <ILock width={14} height={14} style={{ color: C.leaf }} /> Your images never leave this tab
              </p>
            </div>
            <div id="tool" className="mt-10 lg:mt-0" style={{ scrollMarginTop: 96 }}><Compressor /></div>
          </div>
        </div>
      </section>

      <Features />
      <HowItWorks />
      <FAQ />

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}b3`, background: C.paper }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
          <div>
            <div className="flex items-center gap-2.5"><Logo s={24} /><span style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>Squish</span></div>
            <p className="mt-2 max-w-xs text-sm" style={{ color: C.muted }}>A tiny tool for hitting an exact image size — without handing your photos to a server.</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="inline-flex items-center gap-1.5" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: C.muted }}><ILock width={14} height={14} style={{ color: C.leaf }} /> Private by design</span>
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: C.muted }}>© {new Date().getFullYear()} Squish — built in the browser.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
