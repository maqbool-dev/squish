import { useEffect, useRef, useState } from "react";

// Fixed, full-viewport hero background. The looping video plays on all screen
// sizes now; it only falls back to the static poster when the user prefers
// reduced motion or has Save-Data on. Sections below the hero have a solid
// background and scroll over this.
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
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData === true;
    // Screen width no longer gates the video — only reduced-motion / Save-Data.
    if (!reduce && !saveData) setUseVideo(true);

    // Track mobile so we can re-aim the crop (the sphere sits center-low in the
    // frame, which `object-fit: cover` would otherwise crop out on tall phones).
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Some mobile browsers (Chrome/Safari) don't reliably honor the autoPlay
  // attribute; explicitly nudge playback once the video mounts.
  useEffect(() => {
    if (useVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [useVideo]);

  // Desktop keeps the centered crop; mobile shifts down so the glowing sphere
  // (center-to-lower-center of the frame) stays clearly in view.
  const objectPosition = isMobile ? "center 65%" : "center center";

  return (
    <>
      {useVideo ? (
        <video
          ref={videoRef}
          style={{ ...layer, objectFit: "cover", objectPosition }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
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
            backgroundPosition: objectPosition,
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
