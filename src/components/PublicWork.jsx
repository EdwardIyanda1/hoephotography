import { useState } from "react";
import { useApi } from "../lib/api";
import { Skeleton, ErrorPanel, MediaView } from "./PortalUI";
export default function PublicWork({ limit, category }) {
  const { data, loading, error, reload } = useApi("/public/media");
  const [filter, setFilter] = useState("All");
  if (loading) return <Skeleton />;
  if (error) return <ErrorPanel error={error} retry={reload} />;
  const items = data
    .filter(
      (m) =>
        (!category ||
          m.category.toLowerCase().includes(category.toLowerCase())) &&
        (filter === "All" || m.category === filter),
    )
    .slice(0, limit || 120);
  return (
    <div>
      {!limit && !category && (
        <div className="portal-actions">
          {["All", ...new Set(data.map((m) => m.category))].map((c) => (
            <button
              aria-pressed={filter === c}
              key={c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {!items.length ? (
        <p className="portal-empty">
          Published work will appear here when customers have approved sharing.
        </p>
      ) : (
        <div className="portal-grid">
          {items.map((m) => (
            <figure className="media-card" key={m.id}>
              <MediaView media={m} />
              <figcaption>
                {m.caption || m.name}
                <small>{m.category}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
