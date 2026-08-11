import Reveal from "../components/Reveal";
import CornerAccent from "../components/CornerAccent";

export default function About() {
  return (
    <div className="bg-ivory">
      <section className="pt-40 pb-20 max-w-6xl mx-auto px-6 grid md:grid-cols-[1fr_1.2fr] gap-12 items-center">
        <Reveal className="order-2 md:order-1 relative aspect-[4/5] overflow-hidden">
          {/* Placeholder team/studio photo — Lorem Picsum stock, not a real
              photo of Hoe Multimedia Concept. Swap once supplied. */}
          <img
            src="https://picsum.photos/seed/hoe-about/900/1125"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <CornerAccent />
        </Reveal>

        <div className="order-1 md:order-2">
          <Reveal>
            <p className="eyebrow text-xs text-rose mb-3">About</p>
            <h1 className="font-display text-5xl md:text-6xl text-espresso">
              Who we are
            </h1>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-espresso/70 leading-relaxed mt-6">
            <p>
              Details Will be Updated
            </p>
            <p>
               Details Will be Updated
            </p>
            <p className="text-sm text-espresso/40 eyebrow">
              [ TODO: replace with real founder bio / years of experience / equipment list ]
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-espresso text-ivory py-20 text-center">
        <Reveal className="max-w-2xl mx-auto px-6">
          <p className="font-accent-italic text-2xl md:text-3xl">
            "We believe every shoot deserves to feel effortless — so you can
            just be present, and let us handle the rest."
          </p>
        </Reveal>
      </section>
    </div>
  );
}
