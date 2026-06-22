// All compression happens here, 100% in the browser.
// We use the `browser-image-compression` library, which does the heavy
// lifting: it repeatedly lowers quality and shrinks resolution until the
// file fits under the target size — all on a Web Worker so the UI stays smooth.

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

// Compress `file` so the result is under `targetMB` megabytes.
// `onProgress` receives 0–100 as the library works.
export async function compressToTarget(file, targetMB, onProgress) {
  const options = {
    maxSizeMB: targetMB,            // the hard ceiling we want to land under
    useWebWorker: true,             // keep the main thread responsive
    maxIteration: 12,               // how many quality passes it may try
    onProgress: (p) => onProgress?.(Math.round(p)),
    // Let the library decide resolution, but never upscale past the original.
    initialQuality: 0.9,
  };

  const compressedFile = await imageCompression(file, options);

  // The library returns a Blob; give it a sensible download name + type.
  const cleanName = file.name.replace(/\.(jpe?g|png|webp)$/i, "");
  const renamed = new File(
    [compressedFile],
    `${cleanName}-squished.${extensionFor(compressedFile.type)}`,
    { type: compressedFile.type }
  );

  return renamed;
}

function extensionFor(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}
