import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CornerAccent from "./CornerAccent";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-espresso">
      {/* Placeholder mood photo (Lorem Picsum — license-free stock, not a
          real Hoe Multimedia Concept shoot) standing in until real
          photography is supplied. */}
      <div className="absolute inset-0">
        <img
          src="./src/Img/HOE (50).jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(36,28,22,0.55) 0%, rgba(36,28,22,0.75) 55%, rgba(36,28,22,0.92) 100%)",
          }}
        />
      </div>
      <CornerAccent className="inset-6 sm:inset-8" />

      <div className="relative text-center px-6 pt-16">
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="eyebrow text-xs text-gold-soft mb-6"
        >
          Ibadan, Nigeria · Available Nationwide
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl text-ivory leading-tight max-w-3xl mx-auto"
        >
          Every moment,
          <br />
          <span className="font-accent-italic">amplified.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 max-w-lg mx-auto text-ivory/75 text-lg"
        >
          Photography, videography, livestream and aerial drone coverage —
          telling your story the way you'll want to remember it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6"
        >
          <Link
            to="/contact"
            className="px-8 py-3 bg-gold text-espresso font-medium text-sm tracking-wide hover:bg-gold-soft transition-colors"
          >
            Book a session
          </Link>
          <Link
            to="/portfolio"
            className="eyebrow text-xs text-ivory/80 hover:text-gold-soft transition-colors border-b border-ivory/30 hover:border-gold-soft pb-1"
          >
            Explore our work
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 eyebrow text-[10px] text-ivory/50"
      >
        Scroll to explore ↓
      </motion.div>
    </section>
  );
}
