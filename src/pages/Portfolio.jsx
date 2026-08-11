import { useState } from "react";
import Reveal from "../components/Reveal";
import GlassChip from "../components/GlassChip";
import { GALLERY, CATEGORIES } from "../data/gallery";

export default function Portfolio() {
  const [active, setActive] = useState("All");
  const items = active === "All" ? GALLERY : GALLERY.filter((g) => g.category === active);

  return (
    <div className="bg-ivory min-h-screen pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="eyebrow text-xs text-rose mb-3">Portfolio</p>
        <h1 className="font-display text-5xl md:text-6xl text-espresso max-w-2xl">
          Selected work
        </h1>
        <p className="mt-4 text-espresso/50 text-sm max-w-xl">
          Details Will be updated later
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`eyebrow text-xs px-4 py-2 border transition-colors ${
                active === c
                  ? "bg-espresso text-ivory border-espresso"
                  : "border-line text-espresso/60 hover:border-rose hover:text-rose"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <Reveal key={item.label} delay={(idx % 6) * 0.04}>
              <figure className="relative aspect-[4/5] overflow-hidden border border-line">
                <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(0deg, rgba(36,28,22,0.65) 0%, transparent 55%)" }}
                />
                <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2">
                  <span className="text-ivory text-sm">{item.label}</span>
                  <GlassChip>{String(idx + 1).padStart(2, "0")} · {item.tag}</GlassChip>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-16 text-center text-espresso/40">
            No {active.toLowerCase()} work uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
