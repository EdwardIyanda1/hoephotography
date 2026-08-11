import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";

// Placeholder quotes only — clearly generic, unattributed to any real
// named person. Swap these for real client testimonials once the
// business has some to share; don't publish invented quotes as if real.
const QUOTES = [
  {
    quote: "They made the whole day feel effortless — we just showed up and lived in the moment, and somehow every important bit got captured.",
    who: "A recent wedding client",
  },
  {
    quote: "The livestream ran without a hitch, even with three cameras going. Guests who couldn't travel said it felt like they were in the room.",
    who: "A recent corporate client",
  },
  {
    quote: "The drone shots of the property completely changed how it presented online — worth every kobo.",
    who: "A recent real estate client",
  },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  const q = QUOTES[i];

  return (
    <section className="relative bg-espresso text-ivory py-24 overflow-hidden">
      {/* Placeholder backdrop photo (Lorem Picsum stock) behind the quote */}
      <img
        src="https://picsum.photos/seed/hoe-testimonial/1800/900"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-espresso/80" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <span className="font-display text-6xl text-gold-soft leading-none">“</span>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-accent-italic text-2xl md:text-3xl leading-snug">
              {q.quote}
            </p>
            <p className="eyebrow text-xs text-ivory/50 mt-6">{q.who}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-center gap-2">
          {QUOTES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Show testimonial ${idx + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === i ? "bg-gold-soft" : "bg-ivory/25"
              }`}
            />
          ))}
        </div>

        <p className="mt-6 text-[11px] text-ivory/30">
          Sample quotes shown — swap in real client testimonials once available.
        </p>
      </div>
    </section>
  );
}
