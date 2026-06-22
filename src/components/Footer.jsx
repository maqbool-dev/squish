import { LogoMark, Lock } from "./icons.jsx";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-paper">
      <div className="container-page flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-6 w-6" />
            <span className="font-display text-base font-bold tracking-tight">Squish</span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-muted">
            A tiny tool for hitting an exact image size — without handing your
            photos to a server.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            <Lock className="h-3.5 w-3.5 text-leaf" /> Private by design
          </span>
          <p className="font-mono text-xs text-muted">
            © {new Date().getFullYear()} Squish — built in the browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
