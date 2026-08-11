// The site's signature element: a continuous strip of telemetry-style
// readouts, echoing a drone's flight log / a camera's HUD overlay.
// One risk, kept quiet — a single thin strip, not repeated as decoration
// anywhere else on the page.

const READOUTS = [
  "ALT 120M",
  "IBADAN, NG",
  "f/2.8 ISO 400",
  "4K · 60FPS",
  "REC ● 00:00:12",
  "GPS LOCK",
  "WIND 8KM/H",
  "BATT 82%",
];

export default function FlightLog() {
  const items = [...READOUTS, ...READOUTS];
  return (
    <div className="bg-ink-2 border-y border-line overflow-hidden">
      <div className="ticker-track py-2">
        {items.map((t, i) => (
          <span
            key={i}
            className="hud-label text-[10px] text-text-light/40 px-6 whitespace-nowrap"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
