import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import GlassChip from "./GlassChip";
import CornerAccent from "./CornerAccent";
import { GALLERY } from "../data/gallery";

// Homepage "featured work" slider.
const FEATURED = GALLERY.slice(0, 6);

export default function Gallery() {
  const [i, setI] = useState(0);
  const item = FEATURED[i];
  const go = (dir) => setI((p) => (p + dir + FEATURED.length) % FEATURED.length);

  return (
    <section className="bg-ivory-2 py-24 border-t border-line">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <p className="eyebrow text-xs text-rose mb-3">Recent work</p>
            <h2 className="font-display text-4xl md:text-5xl text-espresso">Selected frames</h2>
          </div>
          <Link to="/portfolio" className="eyebrow text-xs text-espresso/60 hover:text-rose transition-colors">
            View full portfolio →
          </Link>
        </Reveal>

        <Reveal>
          <div className="relative">
            <div className="relative aspect-[16/9] overflow-hidden border border-line">
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(0deg, rgba(36,28,22,0.75) 0%, rgba(36,28,22,0.05) 45%, transparent 70%)" }}
                  />
                  <CornerAccent />
                  <div className="absolute inset-x-6 sm:inset-x-10 bottom-6 sm:bottom-10 flex items-end justify-between">
                    <div className="flex flex-col items-start gap-2">
                      <GlassChip>{item.tag}</GlassChip>
                      <p className="font-display text-2xl sm:text-3xl text-ivory">{item.label}</p>
                    </div>
                    <span className="eyebrow text-xs text-ivory/70">
                      {String(i + 1).padStart(2, "0")} / {String(FEATURED.length).padStart(2, "0")}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-ivory border border-line items-center justify-center text-espresso/70 hover:text-rose hover:border-rose transition-colors hidden sm:flex">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={() => go(1)} aria-label="Next" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-11 h-11 rounded-full bg-ivory border border-line items-center justify-center text-espresso/70 hover:text-rose hover:border-rose transition-colors hidden sm:flex">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="mt-4 flex sm:hidden items-center justify-center gap-6">
            <button onClick={() => go(-1)} aria-label="Previous" className="text-espresso/60">←</button>
            <button onClick={() => go(1)} aria-label="Next" className="text-espresso/60">→</button>
          </div>

          <p className="mt-4 text-[11px] text-espresso/35">
            Placeholder photos shown — swap for real shoots once supplied.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
