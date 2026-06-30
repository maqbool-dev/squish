import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Compressor from "./Compressor.jsx";
import EmberField from "./EmberField.jsx";
import { FadeUp } from "./FadeUp.jsx";

// Wraps the compressor in ambient "life" that echoes the hero video: a softly
// breathing amber glow centered behind the card, plus a low ember field
// drifting across the section. Dragging a file over the area intensifies the
// glow and quickens the embers. Reduced-motion safe — no particles and a
// static glow when the user prefers reduced motion.
function AmbientGlow({ active, reduce }) {
  const base = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(720px, 92%)",
    height: 560,
    zIndex: 0,
    borderRadius: "9999px",
    filter: "blur(80px)",
    pointerEvents: "none",
    background:
      "radial-gradient(circle at 50% 45%, rgba(245,165,36,0.5), rgba(242,104,44,0.2) 45%, transparent 70%)",
  };

  if (reduce) {
    return (
      <div
        aria-hidden="true"
        style={{
          ...base,
          opacity: active ? 0.5 : 0.32,
          transform: "translate(-50%, -50%) scale(1.04)",
        }}
      />
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      style={base}
      initial={{ opacity: 0.28 }}
      animate={{
        opacity: active ? [0.42, 0.6, 0.42] : [0.25, 0.45, 0.25],
        scale: active ? [1.04, 1.16, 1.04] : [1, 1.12, 1],
      }}
      transition={{
        duration: active ? 2.4 : 4,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
}

export default function UploadSection() {
  const [dragActive, setDragActive] = useState(false);
  const reduce = useReducedMotion();

  return (
    <section
      id="tool"
      className="relative scroll-mt-24 overflow-hidden bg-paper py-20 sm:py-28"
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        // Only clear when the cursor truly leaves the section, not when it
        // crosses between child elements.
        if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false);
      }}
      onDrop={() => setDragActive(false)}
    >
      {/* Ambient layers sit behind the card (which is opaque) and bleed around
          its edges + into the section's vertical padding. */}
      <AmbientGlow active={dragActive} reduce={reduce} />
      {!reduce && <EmberField active={dragActive} />}

      <div className="container-page relative z-10">
        <FadeUp className="mx-auto max-w-xl">
          <Compressor />
        </FadeUp>
      </div>
    </section>
  );
}
