import { FadeUp } from "./FadeUp.jsx";

// Cinematic hero. The fixed background video + scrim are rendered at the app
// root (HeroBackground); this section is transparent and sits above them.
const HEADLINE = ["ANY", "IMAGE.", "ANY", "SIZE.", "NO", "UPLOADS."];

export default function Hero() {
  return (
    <section
      id="top"
      className="px-8 pt-[70px] pb-[15vh] max-[900px]:px-[18px] max-[900px]:pt-[90px] max-[900px]:pb-[12vh]"
      style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        minHeight: "100vh",
      }}
    >
      {/* Scrim scoped to the hero (scrolls away with it). Left-darken keeps the
          headline readable; the vertical gradient dissolves the video to solid
          #0E0F0A by the hero's bottom edge so there's no seam with the section
          below. Top stays light so the video reads bright up top. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, rgba(14,15,10,0.85) 0%, rgba(14,15,10,0.34) 42%, rgba(14,15,10,0.10) 72%, rgba(14,15,10,0.22) 100%), linear-gradient(to bottom, rgba(14,15,10,0.12) 0%, rgba(14,15,10,0.45) 50%, rgba(14,15,10,0.82) 78%, rgba(14,15,10,0.96) 90%, #0E0F0A 100%)",
        }}
      />

      {/* Soft defocus band: the video gently blurs out as it meets the dark.
          Masked so the blur ramps from none at the top to full at the bottom.
          Pure static CSS — unaffected by reduced-motion. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 140,
          zIndex: 0,
          pointerEvents: "none",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          maxWidth: 720,
        }}
      >
        <h1
          className="font-display"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.25em",
            fontSize: "clamp(26px, 3vw, 42px)",
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "#fff",
            margin: 0,
          }}
        >
          {HEADLINE.map((word, n) => (
            <FadeUp
              as="span"
              key={`${word}-${n}`}
              delay={0.15 + n * 0.08}
              style={{ display: "inline-block" }}
            >
              {word}
            </FadeUp>
          ))}
        </h1>

        <FadeUp
          as="p"
          delay={0.9}
          style={{
            marginTop: 24,
            fontSize: 14,
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.85)",
            maxWidth: 360,
          }}
        >
          Pick a target size — say 2&nbsp;MB — and Squish trims quality and
          resolution until your image fits. All in your browser, nothing
          uploaded.
        </FadeUp>

        <FadeUp as="div" delay={1.05} style={{ marginTop: 32 }}>
          <a href="#tool" className="btn-primary btn-glow">
            Compress an image
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
