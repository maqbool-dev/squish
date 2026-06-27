// All compression happens here, 100% in the browser.
// We use the `browser-image-compression` library, which does the heavy
// lifting on a Web Worker so the UI stays smooth. To reliably hit aggressive
// targets (e.g. 100 KB) we run a two-pass strategy: a quality-first pass with
// a smart resolution ceiling, then — only if needed — a second, more
// aggressive pass that scales the image down further at lower quality.

import imageCompression from "browser-image-compression";

// File types we accept. Anything else gets a friendly error.
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPTED_LABEL = "JPG, PNG, or WebP";

// Guard against absurd uploads (e.g. a 500 MB raw photo) before we start.
export const MAX_INPUT_BYTES = 50 * 1024 * 1024; // 50 MB

// Returns an error string if the file is no good, otherwise null.
export function validateFile(file) {
  if (!file) return "No file selected.";
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `That file type isn't supported. Please use ${ACCEPTED_LABEL}.`;
  }
  if (file.size > MAX_INPUT_BYTES) {
    return "That image is over 50 MB. Please pick a smaller file.";
  }
  return null;
}

// Read the natural width/height of an image File using an object URL.
export function readDimensions(file) {
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

// Pick a sensible maxWidthOrHeight ceiling proportional to how hard the target
// is. If the target is a gentle reduction (> 30% of the source), quality alone
// can get there — keep the original resolution. Otherwise estimate how many
// pixels the target can roughly afford and derive the long side from the
// image's aspect ratio so we go in already close to the goal.
function smartMaxDim(targetBytes, sourceBytes, width, height, bytesPerPixel = 0.25) {
  const maxDim = Math.max(width, height);
  if (!maxDim) return undefined; // dimensions unknown — let the library decide

  if (targetBytes / sourceBytes > 0.3) return maxDim;

  // bytesPerPixel is a rough floor for a heavily compressed image (~0.25 for
  // JPEG/WebP, higher for PNG which compresses less); the 2.0 factor leaves
  // headroom so the second pass rarely has to do much.
  const targetPixels = (targetBytes / bytesPerPixel) * 2.0;
  const longestSide = maxDim;
  const shortestSide = Math.min(width, height) || maxDim;
  const ratio = longestSide / shortestSide; // aspect ratio, always >= 1
  const longSide = Math.round(Math.sqrt(targetPixels * ratio));

  return Math.min(maxDim, Math.max(1, longSide));
}

// Compress `file` so the result is under `targetMB` megabytes.
// `onProgress` receives 0–100 as the two passes work.
// `maxDimOverride` (optional) pins maxWidthOrHeight to an exact value the user
// asked for, bypassing the smart-dimension heuristic.
export async function compressImage(file, targetMB, onProgress, maxDimOverride = undefined) {
  const targetBytes = targetMB * 1024 * 1024;
  const { width, height } = await readDimensions(file);

  // PNG is lossless: quality has no effect, so we lean entirely on resolution.
  // Use a tighter bytes/pixel estimate (PNG compresses less than JPEG) for a
  // more aggressive starting ceiling.
  const isPng = file.type === "image/png";
  const bytesPerPixel = isPng ? 0.6 : 0.25;

  // browser-image-compression only steps quality DOWNWARD from initialQuality
  // until the result first fits under maxSizeMB — it never searches upward to
  // get closer to the ceiling. Starting at the maximum (1.0) forces it to begin
  // large and iterate down to just under the target, instead of returning
  // whatever a lower start (e.g. 0.8) happened to produce — which can sit far
  // below the target. 10 iterations (the library default) gives tight, accurate
  // results from a high start; quality is a no-op for PNG either way.
  const maxIteration = 10;
  const pass1Quality = 1;
  const pass2Quality = 1;

  // When the user pins an exact max dimension, respect it exactly (both passes)
  // instead of letting the heuristic shrink further.
  const usingOverride = maxDimOverride !== undefined;
  const maxDim = usingOverride
    ? maxDimOverride
    : smartMaxDim(targetBytes, file.size, width, height, bytesPerPixel);

  // ── Pass 1: quality-first with a smart resolution ceiling (progress 0–75%).
  let result = await imageCompression(file, {
    maxSizeMB: targetMB,
    maxWidthOrHeight: maxDim,
    useWebWorker: true,
    initialQuality: pass1Quality,
    maxIteration,
    onProgress: (p) => onProgress?.(Math.round((p / 100) * 75)),
  });

  // ── Pass 2: only if we overshot — scale down harder at lower quality
  //    (progress 75–100%). Runs from the original to avoid stacking artifacts.
  if (result.size > targetBytes) {
    const pass2Dim = usingOverride
      ? maxDimOverride
      : Math.max(120, Math.round((maxDim || Math.max(width, height) || 1000) * 0.55));
    result = await imageCompression(file, {
      maxSizeMB: targetMB,
      maxWidthOrHeight: pass2Dim,
      useWebWorker: true,
      initialQuality: pass2Quality,
      maxIteration,
      onProgress: (p) => onProgress?.(75 + Math.round((p / 100) * 25)),
    });
  }

  onProgress?.(100);

  // The library returns a Blob; give it a sensible download name + type,
  // preserving the original format.
  const outType = result.type || file.type;
  const cleanName = file.name.replace(/\.(jpe?g|png|webp)$/i, "");
  return new File(
    [result],
    `${cleanName}-squished.${extensionFor(outType)}`,
    { type: outType }
  );
}

function extensionFor(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}
