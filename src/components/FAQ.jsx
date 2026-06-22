import { useState } from "react";
import { Chevron } from "./icons.jsx";

const faqs = [
  {
    q: "Will my image be uploaded anywhere?",
    a: "No. Everything happens inside your browser tab using a Web Worker. Your image is never sent to a server, which is why it works even offline once the page has loaded.",
  },
  {
    q: "Which file types can I compress?",
    a: "JPG, PNG, and WebP. The output stays in the same format as your original so transparency and color are preserved where it matters.",
  },
  {
    q: "What if my target size is too small?",
    a: "Squish compresses as far as it reasonably can. If it can't quite reach your number without destroying the image, it stops at the smallest sensible result and tells you.",
  },
  {
    q: "Does compressing reduce the resolution?",
    a: "Only if it has to. It lowers quality first; if that's not enough to hit your target, it scales the dimensions down too. It never enlarges an image.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="border-t border-line/70 py-16 sm:py-20">
      <div className="container-page max-w-3xl">
        <div className="mb-10">
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Good questions, honest answers.
          </h2>
        </div>

        <div className="divide-y divide-line rounded-xl2 border border-line bg-surface">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <span className="font-display font-semibold tracking-tight">{item.q}</span>
                  <Chevron
                    className={`h-5 w-5 flex-shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
