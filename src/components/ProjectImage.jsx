import { useState } from 'react';

// Keep URLs on the authenticated API origin. Never forward private images to an external preview service.
export default function ProjectImage({ src, alt, className = '', loading }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div role="status" className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-3 bg-ivory p-4 text-center font-body text-xs text-espresso">
    <p>Preview unavailable. Check your access or try again.</p>

  </div>;
  return <img src={src} alt={alt} loading={loading} className={className} onError={() => setFailed(true)} />;
}
