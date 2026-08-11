// Bespoke, minimal line icons matching the HUD/camera aesthetic —
// intentionally hand-drawn rather than a generic icon-pack import.

export function CameraIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 8.5C3 7.67 3.67 7 4.5 7H7l1.2-1.8c.28-.42.75-.7 1.26-.7h4.08c.51 0 .98.28 1.26.7L16 7h2.5c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5v-9Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="13" r="3.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16.5 9.6h1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function VideoIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="6" width="12.5" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M15.5 10.2 21 7.6v8.8l-5.5-2.6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="6.6" cy="9.4" r=".9" fill="currentColor" />
    </svg>
  );
}

export function LiveIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5.3 5.3a9.8 9.8 0 0 0 0 13.4M18.7 5.3a9.8 9.8 0 0 1 0 13.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export function DroneIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="9.4" y="10.4" width="5.2" height="3.2" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.4 11.2 4.6 6.4M14.6 11.2l4.8-4.8M9.4 12.8l-4.8 4.8M14.6 12.8l4.8 4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="4.2" cy="6" r="1.7" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="19.8" cy="6" r="1.7" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4.2" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="19.8" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ArrowIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h13.5M13 6.5 18.5 12 13 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.5 14.4c-.3-.15-1.7-.85-2-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.14-.17.2-.34.22-.63.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.73-1.63-2.03-.17-.3-.02-.46.13-.6.13-.13.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.37s-1.03 1-1.03 2.45 1.06 2.85 1.2 3.05c.15.2 2.1 3.2 5.08 4.5.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.7-.7 1.94-1.36.24-.67.24-1.25.17-1.36-.07-.12-.27-.2-.57-.34Z"/>
      <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.83.5 3.55 1.36 5.03L2 22l5.1-1.34A9.96 9.96 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.1c-1.67 0-3.24-.46-4.58-1.27l-.33-.2-3.03.8.8-2.94-.21-.32A8.07 8.07 0 0 1 3.92 12c0-4.48 3.64-8.1 8.1-8.1 4.47 0 8.1 3.62 8.1 8.1s-3.63 8.1-8.1 8.1Z"/>
    </svg>
  );
}

export function InstagramIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}
