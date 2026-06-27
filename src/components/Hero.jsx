import Compressor from "./Compressor.jsx";
import { Lock } from "./icons.jsx";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* soft ambient wash, kept subtle */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]
                   bg-[radial-gradient(60%_120%_at_20%_0%,#0D2B17_0%,transparent_60%)]"
        aria-hidden="true"
      />

      <div className="container-page grid items-start gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-20">
        {/* Left: thesis */}
        <div id="tool-copy" className="max-w-xl">
          <p className="eyebrow">Image compressor · runs in your browser</p>

          <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
            Hit any file size.
            <span className="block text-leaf">Down to the megabyte.</span>
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted">
            Name a number — say 2&nbsp;MB — and Squish keeps trimming quality and
            resolution until your image lands under it. No quality guesswork, no
            uploads, no waiting on a server.
          </p>

          <ul className="mt-7 space-y-2.5 font-mono text-sm">
            {[
              "Set an exact target in MB",
              "Watch it shrink, then download",
              "Compare quality before you commit",
            ].map((line, i) => (
              <li key={line} className="flex items-center gap-3 text-ink">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf-soft text-[11px] font-semibold text-leaf">
                  {i + 1}
                </span>
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
            <Lock className="h-3.5 w-3.5 text-leaf" />
            Your images never leave this tab
          </p>
        </div>

        {/* Right: the actual tool */}
        <div id="tool" className="scroll-mt-24">
          <Compressor />
        </div>
      </div>
    </section>
  );
}
