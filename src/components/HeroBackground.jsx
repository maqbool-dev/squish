import { useEffect, useState } from "react";

// Fixed, full-viewport hero background. This is an image-compression tool, so
// the heavy video is opt-in: we start with the lightweight poster and only
// upgrade to the looping video on capable, motion-OK, non-metered displays.
// Sections below the hero have a solid background and scroll over this.
const layer = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100vh",
  zIndex: 0,
  pointerEvents: "none",
};

export default function HeroBackground() {
  // Default to the poster so first paint (and any no-JS / reduced case) is safe.
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 900px)").matches;
    const saveData = navigator.connection?.saveData === true;
    if (!reduce && !small && !saveData) setUseVideo(true);
  }, []);

  return (
    <>
      {useVideo ? (
        <video
          style={{ ...layer, objectFit: "cover" }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          src="/hero-bg.mp4"
          aria-hidden="true"
          // Slow the loop to 0.8× for a calmer, more cinematic motion.
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = 0.8;
          }}
        />
      ) : (
        <div
          style={{
            ...layer,
            backgroundImage: "url(/hero-poster.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
