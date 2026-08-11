import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-ivory flex flex-col items-center justify-center text-center px-6">
      <span className="eyebrow text-xs text-rose">Page not found</span>
      <h1 className="font-display text-4xl md:text-5xl text-espresso mt-4">
        We couldn't find that page
      </h1>
      <p className="text-espresso/60 mt-2">Check the link, or head back home.</p>
      <Link to="/" className="mt-8 px-8 py-3 bg-espresso text-ivory hover:bg-rose transition-colors">
        Back home
      </Link>
    </div>
  );
}
