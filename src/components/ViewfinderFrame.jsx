// The site's signature element: camera-viewfinder autofocus brackets.
// Wraps a visual (hero frame, portfolio tile) with four corner brackets,
// echoing the act of framing a shot — literal to a photography/videography
// brand rather than a decorative border.

export default function ViewfinderFrame({ children, className = "", tone = "light" }) {
  const stroke = tone === "light" ? "stroke-text-light/70" : "stroke-ink/70";
  return (
    <div className={`relative ${className}`}>
      {children}
      {[
        "top-3 left-3 rotate-0",
        "top-3 right-3 rotate-90",
        "bottom-3 right-3 rotate-180",
        "bottom-3 left-3 -rotate-90",
      ].map((pos) => (
        <svg
          key={pos}
          viewBox="0 0 24 24"
          className={`absolute w-5 h-5 pointer-events-none ${pos} ${stroke}`}
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 9V2h7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}
