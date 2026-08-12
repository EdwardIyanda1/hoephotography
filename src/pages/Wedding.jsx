import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Reveal from "../components/Reveal";
import CornerAccent from "../components/CornerAccent";
import GlassChip from "../components/GlassChip";
import ProcessSteps from "../components/ProcessSteps";
import Testimonials from "../components/Testimonials";
import { CameraIcon, VideoIcon, LiveIcon, DroneIcon } from "../components/Icons";

const PACKAGES = [
  {
    name: "Photography",
    Icon: CameraIcon,
    desc: "Full-day coverage from preparation to reception, professionally edited.",
    includes: ["Lead + second shooter", "Full-day coverage", "Professionally retouched gallery", "Online gallery for guests"],
  },
  {
    name: "Photo + Film",
    Icon: VideoIcon,
    desc: "Our most-booked combination — stills and a cinematic film of the day.",
    includes: ["Everything in Photography", "Multi-camera cinematic film", "Highlight reel (3–5 min)", "Color-graded full edit"],
  },
  {
    name: "Full Coverage",
    Icon: LiveIcon,
    desc: "Photo, film and a livestream for guests who can't travel, plus drone.",
    includes: ["Everything in Photo + Film", "Multi-platform livestream", "Aerial drone coverage", "Priority delivery"],
  },
];

// Placeholder wedding photos (Lorem Picsum — license-free stock, not real
// Hoe Multimedia Concept work). Swap for real wedding shoots once supplied.
const MOMENTS = [
  { seed: "hoe-wed-prep", label: "Getting Ready" },
  { seed: "hoe-wed-vows", label: "The Vows" },
  { seed: "hoe-wed-reception", label: "Reception" },
  { seed: "hoe-wed-details", label: "Details" },
];

export default function Wedding() {
  return (
    <div className="bg-ivory">
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        <img
          src="https://picsum.photos/seed/hoe-wedding-hero/1800/1400"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(0deg, rgba(36,28,22,0.85) 0%, rgba(36,28,22,0.25) 60%, rgba(36,28,22,0.35) 100%)" }}
        />
        <CornerAccent className="inset-6 sm:inset-8" />

        <div className="relative max-w-6xl mx-auto px-6 pb-20 pt-40 w-full">
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow text-xs text-gold-soft mb-4"
          >
            Wedding Coverage
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl text-ivory max-w-2xl leading-tight"
          >
            Your day, <span className="font-accent-italic">told in full.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-md text-ivory/80"
          >
            From the first look to the last dance — photography, film,
            livestream and drone, all from one crew.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
          >
            <Link
              to="/contact"
              className="inline-block mt-8 px-8 py-3 bg-gold text-espresso font-medium text-sm tracking-wide hover:bg-gold-soft transition-colors"
            >
              Check availability
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Package tiers — inclusions only, no invented prices. Get a quote. */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <Reveal className="text-center max-w-xl mx-auto">
          <p className="eyebrow text-xs text-rose mb-3">How couples book us</p>
          <h2 className="font-display text-4xl md:text-5xl text-espresso">Wedding packages</h2>
          <p className="mt-4 text-espresso/60">
            Every wedding is different, so pricing is quoted per couple —
            here's what each tier includes.
          </p>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-3 gap-px bg-line border border-line">
          {PACKAGES.map(({ name, Icon, desc, includes }, i) => (
            <Reveal key={name} delay={i * 0.08}>
              <div className="bg-ivory p-8 h-full flex flex-col">
                <div className="w-12 h-12 rounded-full border border-gold-soft flex items-center justify-center text-gold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-2xl text-espresso mt-5">{name}</h3>
                <p className="mt-2 text-sm text-espresso/60">{desc}</p>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-espresso/70">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-gold shrink-0 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="eyebrow text-xs text-rose mt-6 inline-block hover:text-espresso transition-colors">
                  Enquire →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Moments strip */}
      <section className="pb-24 max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="eyebrow text-xs text-rose mb-3">A day, in four moments</p>
          <h2 className="font-display text-4xl md:text-5xl text-espresso mb-10">What we cover</h2>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MOMENTS.map((m, i) => (
            <Reveal key={m.seed} delay={i * 0.06}>
              <figure className="relative aspect-[3/4] overflow-hidden border border-line">
                <img src={`https://picsum.photos/seed/${m.seed}/600/800`} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(36,28,22,0.6) 0%, transparent 50%)" }} />
                <figcaption className="absolute bottom-3 left-3">
                  <GlassChip>{m.label}</GlassChip>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <ProcessSteps />
      <Testimonials />

      <section className="py-20 text-center border-t border-line">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl text-espresso">Have a date in mind?</h2>
          <p className="mt-3 text-espresso/60">Tell us the venue and date — we'll check availability.</p>
          <Link to="/contact" className="inline-block mt-8 px-8 py-3 bg-espresso text-ivory hover:bg-rose transition-colors">
            Get a quote
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
