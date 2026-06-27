import { useRef, useState } from "react";
import { UploadCloud } from "./icons.jsx";
import { ACCEPTED_LABEL } from "../utils/compress.js";

// A single component that handles BOTH drag-and-drop and click-to-browse.
// It just hands the chosen File back to the parent via `onFile`.
export default function Dropzone({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  function handlePick(e) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Reset so picking the same file again still fires onChange.
    e.target.value = "";
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      disabled={disabled}
      className={`group relative flex w-full flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed px-6 py-10 text-center transition-all
        ${dragging
          ? "drag-active border-leaf bg-leaf-soft"
          : "border-line bg-paper/60 hover:border-ink/25 hover:bg-paper"}
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors
          ${dragging ? "bg-leaf text-white" : "bg-surface text-ink shadow-sm group-hover:text-leaf"}`}
      >
        <UploadCloud className="h-6 w-6" />
      </span>

      <span className="space-y-1">
        <span className="block font-medium text-ink">
          {dragging ? "Drop to upload" : "Drag an image here"}
        </span>
        <span className="block text-sm text-muted">
          or <span className="font-medium text-leaf underline-offset-2 group-hover:underline">browse your files</span>
        </span>
      </span>

      <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
        {ACCEPTED_LABEL} · up to 50 MB
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePick}
        className="sr-only"
        tabIndex={-1}
      />
    </button>
  );
}
