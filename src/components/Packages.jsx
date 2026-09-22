import { Link } from "react-router-dom";
import { useApi, money } from "../lib/api";
import { Skeleton, ErrorPanel } from "./PortalUI";
export default function Packages({ category }) {
  const { data, loading, error, reload } = useApi("/public/packages");
  if (loading) return <Skeleton />;
  if (error) return <ErrorPanel error={error} retry={reload} />;
  const items = data.filter(
    (p) =>
      !category || p.category.toLowerCase().includes(category.toLowerCase()),
  );
  return items.length ? (
    <div className="portal-grid">
      {items.map((p) => (
        <article className="portal-card" key={p.id}>
          <p className="eyebrow">{p.category}</p>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <strong>{money(p.price, p.currency)}</strong>
          <Link to="/contact">Ask about this package →</Link>
        </article>
      ))}
    </div>
  ) : (
    <p className="portal-empty">Contact the studio for a tailored quote.</p>
  );
}
