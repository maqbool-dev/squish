import { useState, useEffect, useCallback } from "react";
import Dropzone from "./Dropzone.jsx";
import ResultPreview from "./ResultPreview.jsx";
import { Spinner, Warning, X, Lock } from "./icons.jsx";
import {
  validateFile,
  compressImage,
  readDimensions,
} from "../utils/compress.js";
import { formatBytes } from "../utils/format.js";

const DEFAULT_TARGET_MB = 2;

export default function Compressor() {
  const [original, setOriginal] = useState(null); // { file, url, dimensions }
  const [compressed, setCompressed] = useState(null);
  const [targetMB, setTargetMB] = useState(DEFAULT_TARGET_MB);
  const [status, setStatus] = useState("idle"); // idle | ready | working | done | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  // Refine panel: re-target a finished result without starting over.
  const [refineTarget, setRefineTarget] = useState(""); // "" = keep current target
  const [refineMaxDim, setRefineMaxDim] = useState(""); // "" = no dimension limit
  const [refining, setRefining] = useState(false);

  // Clean up object URLs when they change / unmount to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (original?.url) URL.revokeObjectURL(original.url);
      if (compressed?.url) URL.revokeObjectURL(compressed.url);
    };
  }, [original, compressed]);

  const handleFile = useCallback(async (file) => {
    setError("");
    setCompressed(null);
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      setStatus("error");
      setOriginal(null);
      return;
    }
    const dimensions = await readDimensions(file);
    setOriginal({ file, url: URL.createObjectURL(file), dimensions });
    setStatus("ready");
  }, []);

  async function handleCompress() {
    if (!original) return;
    const target = Number(targetMB);
    if (!target || target <= 0) {
      setError("Enter a target size greater than 0 MB.");
      return;
    }
    setError("");
    setStatus("working");
    setProgress(0);
    try {
      const file = await compressImage(original.file, target, setProgress);
      const dimensions = await readDimensions(file);
      setCompressed({ file, url: URL.createObjectURL(file), dimensions });
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while compressing. Please try another image.");
      setStatus("error");
    }
  }

  // Re-squish a finished result with a new target and/or an explicit max
  // dimension. Always compresses from the ORIGINAL file, never the compressed
  // one, so quality doesn't degrade with each refine. Stays on the result view.
  async function reCompress() {
    const newTarget = refineTarget !== "" ? Number(refineTarget) : targetMB;
    const maxDim = refineMaxDim !== "" ? Number(refineMaxDim) : undefined;
    if (!newTarget || newTarget <= 0) return;

    setError("");
    setRefining(true);
    setProgress(0);
    try {
      const file = await compressImage(original.file, newTarget, setProgress, maxDim);
      const dimensions = await readDimensions(file);
      setCompressed({ file, url: URL.createObjectURL(file), dimensions });
      setTargetMB(newTarget);
      setRefineTarget("");
      setRefineMaxDim("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while re-compressing.");
    } finally {
      setRefining(false);
      setProgress(0);
    }
  }

  function reset() {
    setOriginal(null);
    setCompressed(null);
    setError("");
    setProgress(0);
    setStatus("idle");
    setTargetMB(DEFAULT_TARGET_MB);
    setRefineTarget("");
    setRefineMaxDim("");
  }

  const working = status === "working";

  return (
    <div className="rounded-xl2 border border-line bg-surface p-5 shadow-card sm:p-6">
      {/* Card header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold tracking-tight">Compress an image</h2>
        {original && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-4 w-4" /> Start over
          </button>
        )}
      </div>

      {/* Step 1: upload (hidden once we have a result) */}
      {status !== "done" && (
        <Dropzone onFile={handleFile} disabled={working} />
      )}

      {/* Selected file chip */}
      {original && status !== "done" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-paper/60 p-3">
          <img src={original.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{original.file.name}</p>
            <p className="font-mono text-xs text-muted">{formatBytes(original.file.size)}</p>
          </div>
        </div>
      )}

      {/* Step 2: target size + action */}
      {original && status !== "done" && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Target size
            </span>
            <div className="mt-1.5 flex overflow-hidden rounded-xl border border-line bg-paper/60 focus-within:border-leaf">
              <input
                type="number"
                inputMode="decimal"
                min="0.05"
                step="0.1"
                value={targetMB}
                disabled={working}
                onChange={(e) => setTargetMB(e.target.value)}
                className="w-full bg-transparent px-4 py-3 font-mono text-lg outline-none disabled:opacity-60"
              />
              <span className="flex items-center border-l border-line bg-surface px-4 font-mono text-sm font-medium text-muted">
                MB
              </span>
            </div>
          </label>

          <button
            type="button"
            onClick={handleCompress}
            disabled={working}
            className="btn-primary w-full"
          >
            {working ? (
              <>
                <Spinner className="h-5 w-5" /> Compressing… {progress}%
              </>
            ) : (
              <>Compress to {targetMB || "?"} MB</>
            )}
          </button>

          {/* Progress bar */}
          {working && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="progress-shimmer h-full rounded-full bg-leaf transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-muted">
            <Lock className="h-3.5 w-3.5" /> Processed in your browser — never uploaded
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber/30 bg-amber-soft px-4 py-3 text-sm text-amber">
          <Warning className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 3: result */}
      {status === "done" && compressed && original && (
        <>
          <ResultPreview
            original={original}
            compressed={compressed}
            savings={savings(original.file.size, compressed.file.size)}
            targetMB={Number(targetMB)}
          />

          {/* Refine: re-squish from the original with a new target / max size */}
          <div className="mt-5 space-y-3 border-t border-line pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  New target
                </span>
                <div className="mt-1.5 flex overflow-hidden rounded-xl border border-line bg-paper/60 focus-within:border-leaf">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0.05"
                    step="0.1"
                    placeholder={targetMB}
                    value={refineTarget}
                    disabled={refining}
                    onChange={(e) => setRefineTarget(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 font-mono text-lg outline-none disabled:opacity-60"
                  />
                  <span className="flex items-center border-l border-line bg-surface px-4 font-mono text-sm font-medium text-muted">
                    MB
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  Max dimension (px)
                </span>
                <div className="mt-1.5 flex overflow-hidden rounded-xl border border-line bg-paper/60 focus-within:border-leaf">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="100"
                    step="10"
                    placeholder="No limit"
                    value={refineMaxDim}
                    disabled={refining}
                    onChange={(e) => setRefineMaxDim(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 font-mono text-lg outline-none disabled:opacity-60"
                  />
                  <span className="flex items-center border-l border-line bg-surface px-4 font-mono text-sm font-medium text-muted">
                    px
                  </span>
                </div>
              </label>
            </div>

            <button
              type="button"
              onClick={reCompress}
              disabled={refining}
              className="btn-ghost w-full"
            >
              {refining ? (
                <>
                  <Spinner className="h-5 w-5" /> Re-squishing… {progress}%
                </>
              ) : (
                <>Re-squish</>
              )}
            </button>
          </div>

          <button type="button" onClick={reset} className="btn-ghost mt-3 w-full">
            Compress another image
          </button>
        </>
      )}
    </div>
  );
}

function savings(a, b) {
  return Math.max(0, Math.round(((a - b) / a) * 100));
}
