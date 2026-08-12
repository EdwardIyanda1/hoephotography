import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/wedding", label: "Weddings" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `eyebrow text-xs transition-colors ${
      isActive ? "text-rose" : "text-espresso/70 hover:text-rose"
    }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-ivory/90 backdrop-blur border-b border-line" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <NavLink to="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-xl text-espresso">Hoe</span>
          <span className="eyebrow text-[10px] text-espresso">Multimedia Concept</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/contact"
            className="eyebrow text-xs px-5 py-2.5 bg-espresso text-ivory hover:bg-rose transition-colors"
          >
            Get a quote
          </NavLink>
        </nav>

        <button
          className="md:hidden text-espresso"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-ivory border-t border-line px-6 py-4 flex flex-col gap-4">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/contact" onClick={() => setOpen(false)} className="eyebrow text-sm text-rose">
            Get a quote →
          </NavLink>
        </nav>
      )}
    </header>
  );
}
