import { Gauge, Resize, Lock } from "./icons.jsx";

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
    <section id="features" className="border-t border-line/70 py-16 sm:py-20">
      <div className="container-page">
        <div className="max-w-xl">
          <p className="eyebrow">Why Squish</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Precise where it counts, quiet everywhere else.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl2 border border-line bg-surface p-6 shadow-card transition-shadow hover:shadow-lift"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-soft text-leaf">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
