// Small frosted-glass label chip — a light nod to the glass/frosted UI
// reference, used sparingly for tags overlaid on photos.
export default function GlassChip({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] tracking-wide uppercase font-medium text-ivory bg-ivory/15 backdrop-blur-md border border-ivory/25 ${className}`}
    >
      {children}
    </span>
  );
}
