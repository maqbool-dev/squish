import { Gauge, Resize, Lock } from "./icons.jsx";
import { FadeUp } from "./FadeUp.jsx";

const features = [
  {
    icon: Gauge,
    title: "Target-size control",
    body: "Type the ceiling you need — 500 KB, 2 MB, anything. Squish iterates until the file fits.",
  },
  {
    icon: Resize,
    title: "Smart resolution",
    body: "When quality alone won't get there, it scales dimensions down too — automatically, never upscaled.",
  },
  {
    icon: Lock,
    title: "Stays on your device",
    body: "Compression runs locally with a Web Worker. Nothing is sent anywhere, ever.",
  },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-line bg-paper py-16 sm:py-20">
      <div className="container-page">
        <FadeUp className="max-w-xl">
          <p className="eyebrow">Why Squish</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Precise where it counts, quiet everywhere else.
          </h2>
        </FadeUp>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }, i) => (
            <FadeUp key={title} delay={i * 0.08}>
              <div
                data-glow
                className="card h-full rounded-xl2 border border-line bg-surface p-6 shadow-card hover:shadow-lift"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-soft text-amber">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
