// Thin gold corner brackets — a lighter, warm-toned echo of the
// camera-viewfinder framing idea, used only around real photos now that
// we have them (hero image, gallery/portfolio tiles).
export default function CornerAccent({ className = "" }) {
  return (
    <div className={`absolute inset-3 pointer-events-none ${className}`} aria-hidden="true">
      {[
        "top-0 left-0 rotate-0",
        "top-0 right-0 rotate-90",
        "bottom-0 right-0 rotate-180",
        "bottom-0 left-0 -rotate-90",
      ].map((pos) => (
        <svg key={pos} viewBox="0 0 24 24" className={`absolute w-4 h-4 text-ivory/80 ${pos}`} fill="none">
          <path d="M2 9V2h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}
