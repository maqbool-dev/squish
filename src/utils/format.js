// Small helpers for turning raw numbers into human-friendly text.
// Kept separate so the UI components stay clean and easy to read.

// Turn a byte count into "1.8 MB" / "640 KB" / "0.9 KB"
export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 2 : 1)} MB`;
}

// How much smaller the compressed file is, as a whole-number percentage.
// Returns 0 if the file somehow got bigger (can happen with tiny images).
export function savingsPercent(originalBytes, compressedBytes) {
  if (!originalBytes || !compressedBytes) return 0;
  const saved = ((originalBytes - compressedBytes) / originalBytes) * 100;
  return Math.max(0, Math.round(saved));
}

// "4000 × 3000" from an image element / bitmap.
export function formatDimensions(width, height) {
  if (!width || !height) return "—";
  return `${width} × ${height}`;
}

// Read the natural width/height of an image File using an object URL.
export function readImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
