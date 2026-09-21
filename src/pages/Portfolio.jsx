import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { CATEGORIES, GALLERY } from "../data/gallery";

const FIRST_BATCH = 18;
const BATCH_SIZE = 12;

function ArrowIcon({ left = false, className = "w-5 h-5" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} ${left ? "rotate-180" : ""}`}
    >
      <path
        d="M5 12h14M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path
        d="M9 5H5v4M15 5h4v4M9 19H5v-4M15 19h4v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path
        d="M5 5l14 14M19 5 5 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(FIRST_BATCH);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return GALLERY;
    return GALLERY.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const selectedItem =
    selectedIndex === null ? null : filteredItems[selectedIndex];
  const heroItems = GALLERY.slice(0, 3);
  const progress = filteredItems.length
    ? Math.min((visibleItems.length / filteredItems.length) * 100, 100)
    : 0;

  function selectCategory(category) {
    setActiveCategory(category);
    setVisibleCount(FIRST_BATCH);
    setSelectedIndex(null);
  }

  function openImage(item) {
    setSelectedIndex(filteredItems.indexOf(item));
  }

  function openHeroImage(item) {
    setActiveCategory("All");
    setSelectedIndex(GALLERY.indexOf(item));
  }

  const moveSelection = useCallback(
    (direction) => {
      if (filteredItems.length < 2) return;

      setSelectedIndex((current) => {
        if (current === null) return 0;
        return (
          (current + direction + filteredItems.length) % filteredItems.length
        );
      });
    },
    [filteredItems.length]
  );

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowLeft") moveSelection(-1);
      if (event.key === "ArrowRight") moveSelection(1);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, moveSelection]);

  return (
    <main className="bg-ivory text-espresso">
      <section className="relative overflow-hidden bg-espresso text-ivory">
        <div className="max-w-6xl mx-auto px-6 pt-36 pb-16 md:pt-44 md:pb-24">
          <div className="grid items-center gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow text-xs text-gold-soft mb-5">
                Portfolio / Photography
              </p>
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.98] tracking-tight">
                A closer look at <span className="font-accent-italic">our photography.</span>
              </h1>
              <p className="mt-7 max-w-md text-sm md:text-base leading-7 text-ivory/65">
                Portraits, celebrations, events and documentary moments captured
                by Hoe Multimedia Concept.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#work"
                  className="inline-flex items-center gap-4 bg-gold px-6 py-3 text-sm font-medium text-espresso transition-colors hover:bg-gold-soft"
                >
                  View the work
                  <ArrowIcon />
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center border border-ivory/30 px-6 py-3 text-sm text-ivory transition-colors hover:border-ivory hover:bg-ivory hover:text-espresso"
                >
                  Book a session
                </Link>
              </div>
            </Reveal>

            {heroItems.length > 0 && (
              <Reveal delay={0.1} className="relative">
                <div className="grid h-[440px] grid-cols-5 grid-rows-2 gap-3 sm:h-[560px] md:gap-4">
                  <button
                    type="button"
                    onClick={() => openHeroImage(heroItems[0])}
                    className="group relative col-span-3 row-span-2 overflow-hidden bg-ivory/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    aria-label={`Open ${heroItems[0].label}`}
                  >
                    <img
                      src={heroItems[0].image}
                      alt={`${heroItems[0].label}, Hoe Multimedia photograph`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="eager"
                      fetchPriority="high"
                    />
                    <span className="absolute bottom-0 inset-x-0 flex items-center justify-between bg-espresso/80 px-4 py-3 text-xs">
                      <span className="truncate">{heroItems[0].label}</span>
                      <ExpandIcon />
                    </span>
                  </button>

                  {heroItems.slice(1).map((item) => (
                    <button
                      key={item.image}
                      type="button"
                      onClick={() => openHeroImage(item)}
                      className="group relative col-span-2 overflow-hidden bg-ivory/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      aria-label={`Open ${item.label}`}
                    >
                      <img
                        src={item.image}
                        alt={`${item.label}, Hoe Multimedia photograph`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                        loading="eager"
                      />
                      <span className="absolute inset-0 bg-espresso/0 transition-colors group-hover:bg-espresso/15" />
                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-ivory text-espresso opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <ExpandIcon />
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-ivory/45">
                  <span>Selected frames</span>
                  <span>Hoe Multimedia Concept</span>
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section id="work" className="scroll-mt-24 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="flex flex-col gap-8 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-xs text-rose mb-3">Selected work</p>
              <h2 className="font-display text-4xl md:text-5xl">
                The complete gallery
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-3" aria-label="Portfolio filters">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    aria-pressed={isActive}
                    className={`eyebrow border-b pb-1 text-[10px] transition-colors ${
                      isActive
                        ? "border-espresso text-espresso"
                        : "border-transparent text-espresso/40 hover:border-rose hover:text-rose"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}

              <span className="text-xs tabular-nums text-espresso/35" aria-live="polite">
                {filteredItems.length} {filteredItems.length === 1 ? "image" : "images"}
              </span>
            </div>
          </Reveal>

          {visibleItems.length > 0 ? (
            <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
              {visibleItems.map((item, index) => (
                <figure key={item.image} className="group mb-7 break-inside-avoid">
                  <button
                    type="button"
                    onClick={() => openImage(item)}
                    className="relative block w-full cursor-zoom-in overflow-hidden bg-espresso/5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                    aria-label={`Open ${item.label}`}
                  >
                    <img
                      src={item.image}
                      alt={`${item.label}, Hoe Multimedia portfolio photograph`}
                      className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.015]"
                      loading={index < 6 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <span className="absolute inset-0 bg-espresso/0 transition-colors group-hover:bg-espresso/10" />
                    <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center bg-ivory text-espresso opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <ExpandIcon />
                    </span>
                  </button>

                  <figcaption className="mt-3 flex items-center justify-between gap-4 border-b border-line pb-3">
                    <span className="truncate text-sm">{item.label}</span>
                    <span className="eyebrow shrink-0 text-[9px] text-espresso/35">
                      {String(index + 1).padStart(2, "0")} / {item.tag}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-b border-line">
              <p className="font-display text-2xl">No {activeCategory.toLowerCase()} work yet.</p>
              <p className="mt-2 text-sm text-espresso/45">
                New work will appear here when it is uploaded.
              </p>
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="mt-10 max-w-md mx-auto text-center">
              <p className="text-xs text-espresso/45" aria-live="polite">
                Showing {visibleItems.length} of {filteredItems.length}
              </p>
              <div className="mt-3 h-px bg-line overflow-hidden" aria-hidden="true">
                <div
                  className="h-full bg-rose transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {visibleItems.length < filteredItems.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}
                  className="mt-7 border border-espresso px-8 py-3 text-xs uppercase tracking-widest transition-colors hover:bg-espresso hover:text-ivory"
                >
                  Load more photographs
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-ivory-2 py-20 md:py-24">
        <Reveal className="max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow text-xs text-rose mb-3">Your project</p>
            <h2 className="font-display text-4xl md:text-5xl max-w-2xl">
              Planning a shoot or an event?
            </h2>
            <p className="mt-4 max-w-xl text-espresso/60 leading-relaxed">
              Share the date, location and type of coverage you need. We will
              recommend the right setup for the project.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center justify-between gap-8 bg-espresso px-7 py-4 text-sm text-ivory transition-colors hover:bg-rose"
          >
            Get a custom quote
            <ArrowIcon />
          </Link>
        </Reveal>
      </section>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-espresso text-ivory"
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing ${selectedItem.label}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedIndex(null);
          }}
        >
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-ivory/15 px-5 md:px-8">
            <div className="min-w-0">
              <p className="truncate text-sm">{selectedItem.label}</p>
              <p className="eyebrow mt-1 text-[9px] text-ivory/40">
                {String(selectedIndex + 1).padStart(2, "0")} / {String(filteredItems.length).padStart(2, "0")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="flex h-11 w-11 items-center justify-center border border-ivory/25 transition-colors hover:border-ivory hover:bg-ivory hover:text-espresso"
              aria-label="Close image viewer"
              autoFocus
            >
              <CloseIcon />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center p-5 md:px-24 md:py-8">
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={() => moveSelection(-1)}
                className="absolute left-5 z-10 hidden h-12 w-12 items-center justify-center border border-ivory/25 transition-colors hover:border-ivory hover:bg-ivory hover:text-espresso md:flex"
                aria-label="Previous photograph"
              >
                <ArrowIcon left />
              </button>
            )}

            <img
              key={selectedItem.image}
              src={selectedItem.image}
              alt={`${selectedItem.label}, Hoe Multimedia portfolio photograph`}
              className="max-h-full max-w-full object-contain"
            />

            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={() => moveSelection(1)}
                className="absolute right-5 z-10 hidden h-12 w-12 items-center justify-center border border-ivory/25 transition-colors hover:border-ivory hover:bg-ivory hover:text-espresso md:flex"
                aria-label="Next photograph"
              >
                <ArrowIcon />
              </button>
            )}
          </div>

          {filteredItems.length > 1 && (
            <div className="grid shrink-0 grid-cols-2 border-t border-ivory/15 md:hidden">
              <button
                type="button"
                onClick={() => moveSelection(-1)}
                className="flex items-center justify-center gap-3 border-r border-ivory/15 py-4 text-xs uppercase tracking-widest"
              >
                <ArrowIcon left /> Previous
              </button>
              <button
                type="button"
                onClick={() => moveSelection(1)}
                className="flex items-center justify-center gap-3 py-4 text-xs uppercase tracking-widest"
              >
                Next <ArrowIcon />
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
