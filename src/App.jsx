import { useEffect } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Features from "./components/Features.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import FAQ from "./components/FAQ.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  // Cursor glow: a soft light that lags behind the pointer for a dreamy feel.
  // Skipped entirely on touch devices, where there is no cursor to follow.
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const root = document.documentElement;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const glow = { x: target.x, y: target.y };
    let frame;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const PROXIMITY = 280; // px radius over which a card reacts to the cursor

    const tick = () => {
      // Lerp the actual position toward the target — small factor = slow trail.
      glow.x += (target.x - glow.x) * 0.1;
      glow.y += (target.y - glow.y) * 0.1;
      root.style.setProperty("--glow-x", `${glow.x}px`);
      root.style.setProperty("--glow-y", `${glow.y}px`);

      // Element proximity: nudge each card's border toward leaf as the
      // cursor nears its center. 1 = right on top, 0 = at/beyond PROXIMITY.
      const cards = document.querySelectorAll(".card, [data-glow]");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = Math.hypot(target.x - cx, target.y - cy);
        const proximity = distance < PROXIMITY ? Math.max(0, 1 - distance / PROXIMITY) : 0;
        card.style.setProperty("--card-proximity", `${proximity}`);
      });

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative z-10 min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
