const steps = [
  {
    n: "01",
    title: "Upload your image",
    body: "Drag a JPG, PNG, or WebP onto the tool, or browse for one. It loads instantly and stays local.",
  },
  {
    n: "02",
    title: "Set your target size",
    body: "Enter the maximum size you need in megabytes. The default is 2 MB — change it to anything.",
  },
  {
    n: "03",
    title: "Download the result",
    body: "Squish compresses, shows the savings, and lets you compare quality before you download.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-t border-line/70 bg-paper py-16 sm:py-20">
      <div className="container-page">
        <div className="max-w-xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps, start to download.
          </h2>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              data-glow
              className="card rounded-xl2 border border-line bg-surface p-6 shadow-card hover:shadow-lift sm:p-7"
            >
              <span className="font-mono text-2xl font-semibold text-leaf">{s.n}</span>
              <h3 className="mt-3 font-display text-lg font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
