import { useMemo } from "react";
import { motion } from "motion/react";

// A handful of warm embers drifting up behind the upload card — echoes the
// hero video. Kept deliberately low-count for performance. The parent only
// renders this when motion is allowed; on drag-over it passes active=true to
// speed the drift up so dropping a file feels reactive.
const COLORS = ["#F5A524", "#F2682C", "#D9342B"]; // amber, ember, spark

export default function EmberField({ active = false }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 100, // %
        size: 3 + Math.random() * 4, // px
        color: COLORS[i % COLORS.length],
        duration: 6 + Math.random() * 6, // 6–12s
        delay: Math.random() * 6,
        drift: (Math.random() - 0.5) * 48, // horizontal sway, px
        peak: 0.2 + Math.random() * 0.4, // opacity flicker peak 0.2–0.6
        rise: 320 + Math.random() * 220, // vertical travel, px
      })),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {dots.map((d) => (
        <motion.span
          key={d.id}
          style={{
            position: "absolute",
            bottom: -12,
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            borderRadius: "9999px",
            background: d.color,
            filter: "blur(1px)",
          }}
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{
            y: [0, -d.rise],
            x: [0, d.drift, 0],
            opacity: [0, d.peak, d.peak, 0],
          }}
          transition={{
            duration: active ? d.duration * 0.55 : d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.2, 0.8, 1],
          }}
        />
      ))}
    </div>
  );
}
