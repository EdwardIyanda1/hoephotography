import { Link } from "react-router-dom";
export function Skeleton() {
  return (
    <div className="portal-grid" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      {[1, 2, 3].map((n) => (
        <div key={n} className="skeleton" />
      ))}
    </div>
  );
}
export function ErrorPanel({ error, retry }) {
  return (
    <div className="portal-message" role="alert">
      <p>{error.message}</p>
      {error.status === 401 ? (
        <Link to={`/login?next=${encodeURIComponent(location.pathname)}`}>
          Sign in to continue
        </Link>
      ) : (
        <button onClick={retry}>Try again</button>
      )}
    </div>
  );
}
export function Field({ label, ...props }) {
  return (
    <label className="portal-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
export function MediaView({ media }) {
  return media.mime.startsWith("video/") ? (
    <video
      controls
      preload="metadata"
      src={media.url}
      aria-label={media.caption || media.name}
    />
  ) : (
    <img loading="lazy" src={media.url} alt={media.caption || media.name} />
  );
}
