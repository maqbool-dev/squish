import CompareSlider from "./CompareSlider.jsx";
import { Download, Check } from "./icons.jsx";
import { formatBytes, formatDimensions } from "../utils/format.js";

// Shown after a successful compression. Pure presentation — all the data
// is passed in from the parent Compressor.
export default function ResultPreview({ original, compressed, savings, targetMB }) {
  function handleDownload() {
    const url = URL.createObjectURL(compressed.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = compressed.file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const underTarget = compressed.file.size <= targetMB * 1024 * 1024;

  return (
    <div className="space-y-5">
      {/* Headline result */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Result</p>
          <p className="count-up mt-1 font-display text-4xl font-extrabold leading-none tracking-tight text-leaf">
            −{savings}%
          </p>
          <p className="mt-1 text-sm text-muted">smaller than the original</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
          ${underTarget ? "bg-leaf-soft text-leaf" : "bg-amber-soft text-amber"}`}>
          <Check className="h-4 w-4" />
          {underTarget ? `Under ${targetMB} MB` : "Smallest possible"}
        </div>
      </div>

      {/* Size meter: original bar shrinking down to compressed */}
      <SizeMeter
        originalBytes={original.file.size}
        compressedBytes={compressed.file.size}
      />

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Original" value={formatBytes(original.file.size)}
          sub={formatDimensions(original.dimensions.width, original.dimensions.height)} />
        <Stat label="Compressed" value={formatBytes(compressed.file.size)}
          sub={formatDimensions(compressed.dimensions.width, compressed.dimensions.height)} accent />
      </div>

      {/* Visual compare */}
      <CompareSlider
        originalUrl={original.url}
        compressedUrl={compressed.url}
        dimensions={formatDimensions(compressed.dimensions.width, compressed.dimensions.height)}
      />

      <button type="button" onClick={handleDownload} className="btn-primary w-full">
        <Download className="h-5 w-5" />
        Download compressed image
      </button>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className={`card rounded-xl border px-4 py-3 ${accent ? "border-leaf/30 bg-leaf-soft/50" : "border-line bg-paper/60"}`}>
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-0.5 font-mono text-lg font-semibold ${accent ? "text-leaf" : "text-ink"}`}>{value}</p>
      <p className="font-mono text-[11px] text-muted">{sub} px</p>
    </div>
  );
}

function SizeMeter({ originalBytes, compressedBytes }) {
  const ratio = Math.max(4, Math.round((compressedBytes / originalBytes) * 100));
  return (
    <div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-leaf transition-[width] duration-700 ease-out"
          style={{ width: `${ratio}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] text-muted">
        <span>{formatBytes(compressedBytes)}</span>
        <span>{formatBytes(originalBytes)}</span>
      </div>
    </div>
  );
}
