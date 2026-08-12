import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Reveal from "../components/Reveal";
import GlassChip from "../components/GlassChip";
import { BuildingIcon, LeafIcon, CraneIcon } from "../components/BusinessIcons";

// TODO: this whole page is a placeholder scaffold for the second business
// (Properties / Agriculture / Construction) — swap the business name,
// copy and contact number once confirmed. It intentionally does NOT share
// Hoe Multimedia Concept's branding, since this is a different company.

const BUSINESS_NAME = "House Of Eri";
const BUSINESS_WHATSAPP = "2348032503216"; // TODO: real number

const PILLARS = [
  {
    key: "properties",
    name: "Properties",
    Icon: BuildingIcon,
    accent: "#2E4A63",
    desc: "Residential and commercial land and property — sales, development and management.",
    points: ["Land sales & documentation", "Residential & commercial development", "Property management"],
  },
  {
    key: "agriculture",
    name: "Agriculture",
    Icon: LeafIcon,
    accent: "#3F6B4A",
    desc: "Farmland and agricultural production, from cultivation to harvest.",
    points: ["Farmland leasing & sales", "Crop production", "Produce supply"],
  },
  {
    key: "construction",
    name: "Construction",
    Icon: CraneIcon,
    accent: "#9A5B33",
    desc: "Building and civil works, from groundbreaking to finishing.",
    points: ["Residential & commercial builds", "Renovation & finishing", "Project management"],
  },
];

export default function OtherBusiness() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waLink = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(
    `Hello, I'd like to enquire about ${BUSINESS_NAME}'s services.`
  )}`;

  return (
    <div className="bg-[#F5F2EA] text-[#1B2430]">
      {/* self-contained nav — no Hoe Multimedia branding */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-colors ${scrolled ? "bg-[#F5F2EA]/95 backdrop-blur border-b border-black/10" : ""}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
          <span className="font-display text-xl tracking-tight">{BUSINESS_NAME}</span>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-wide uppercase px-5 py-2.5 bg-[#1B2430] text-[#F5F2EA] hover:bg-[#2E4A63] transition-colors"
          >
            Enquire
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-end overflow-hidden">
        <img
          src="https://hoephotography.vercel.app/1001.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1B2430]/70" />
        <div className="relative max-w-6xl mx-auto px-6 pb-20 pt-40 w-full">
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-xs tracking-widest uppercase text-[#D9C9A8] mb-4"
          >
            Properties · Agriculture · Construction
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl text-[#F5F2EA] max-w-2xl leading-tight"
          >
            {BUSINESS_NAME}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-md text-[#F5F2EA]/80"
          >
            [ TODO: one-line description of what the business does across
            its three areas ]
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 px-8 py-3 bg-[#D9C9A8] text-[#1B2430] font-medium text-sm tracking-wide hover:bg-[#F5F2EA] transition-colors"
            >
              Speak to us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <Reveal className="text-center max-w-xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-[#2E4A63] mb-3">What we do</p>
          <h2 className="font-display text-4xl md:text-5xl">Three businesses, one standard.</h2>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {PILLARS.map(({ key, name, Icon, accent, desc, points }, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <div className="bg-white/60 border border-black/10 p-8 h-full flex flex-col">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${accent}1a`, color: accent }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl mt-5">{name}</h3>
                <p className="mt-2 text-sm text-[#1B2430]/65">{desc}</p>
                <ul className="mt-5 space-y-2 flex-1">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-[#1B2430]/70">
                      <span className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gallery strip */}
      <section className="pb-24 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-4">
          {["other-biz-properties", "other-biz-farm", "other-biz-construction"].map((seed, i) => (
            <Reveal key={seed} delay={i * 0.06}>
              <figure className="relative aspect-square overflow-hidden">
                <img src={`https://picsum.photos/seed/${seed}/600/600`} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(27,36,48,0.55) 0%, transparent 50%)" }} />
                <figcaption className="absolute bottom-3 left-3">
                  <GlassChip>{PILLARS[i].name}</GlassChip>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-[#1B2430]/40">
          Placeholder photos shown (license-free stock) — swap for real project photos once supplied.
        </p>
      </section>

      {/* Contact */}
      <section className="bg-[#1B2430] text-[#F5F2EA] py-24 text-center">
        <Reveal className="max-w-xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase text-[#D9C9A8] mb-3">Get in touch</p>
          <h2 className="font-display text-3xl md:text-4xl">
            Tell us which area you're interested in.
          </h2>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 px-8 py-3 bg-[#D9C9A8] text-[#1B2430] font-medium text-sm tracking-wide hover:bg-[#F5F2EA] transition-colors"
          >
            Message us on WhatsApp
          </a>
        </Reveal>
      </section>

      <footer className="py-8 text-center text-[11px] text-[#1B2430]/40">
        © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
