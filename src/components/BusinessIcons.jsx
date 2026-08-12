// Icon set for the other-business page (Properties / Agriculture /
// Construction) — kept separate from Icons.jsx since that set is scoped
// to the photography/media brand.

export function BuildingIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="3.5" width="9" height="17" rx="0.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 9.5h4.5c.55 0 1 .45 1 1V20a.5.5 0 0 1-.5.5H14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 7h1.5M7.5 10h1.5M7.5 13h1.5M11 7h1.5M11 10h1.5M11 13h1.5M9.25 20.5V17h1.5v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.8 12.5h1.2M15.8 15h1.2M15.8 17.5h1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function LeafIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 19c-1-6 2.5-13 13-14 1 8.5-4 14-13 14Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 18c3-3.5 6-7 11.5-12.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function CraneIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 20V6.5l9-3.5v3.2L5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M14 6.2h5.2M17.5 6.2 15.8 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.8 12v2.4M13.5 20h4.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="14.4" y="14.4" width="2.8" height="2.2" rx="0.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 20h17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
