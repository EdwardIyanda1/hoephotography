import Reveal from "./Reveal";

const PROCESS = [
  { step: "01", title: "Brief", desc: "You tell us the date, venue and what matters most to capture." },
  { step: "02", title: "Plan", desc: "We confirm crew size, equipment and a shot list before the day." },
  { step: "03", title: "Shoot", desc: "Full coverage on the day — photo, video, drone or live, as agreed." },
  { step: "04", title: "Deliver", desc: "Edited gallery and/or final video delivered on the agreed timeline." },
];

export default function ProcessSteps() {
  return (
    <section className="bg-ivory-2 py-24 border-t border-line">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="eyebrow text-xs text-rose mb-3">How it works</p>
          <h2 className="font-display text-4xl md:text-5xl max-w-xl text-espresso">
            Our signature process.
          </h2>
        </Reveal>

        <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          {PROCESS.map(({ step, title, desc }, i) => (
            <Reveal key={step} delay={i * 0.08}>
              <span className="font-display text-4xl text-gold-soft">{step}</span>
              <h3 className="font-display text-xl mt-3 text-espresso">{title}</h3>
              <p className="mt-2 text-espresso/60 text-sm leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
