import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useApi, money } from "../lib/api";
import { Skeleton, ErrorPanel, Field } from "../components/PortalUI";
export function ProjectForm({ initial = {}, onSave }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    try {
      await onSave(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="portal-card" onSubmit={submit}>
      <Field
        label="Project title"
        name="title"
        defaultValue={initial.title}
        required
        maxLength={200}
      />
      {!initial.id && (
        <Field
          label="Customer owner email"
          name="owner_email"
          type="email"
          required
        />
      )}
      <label className="portal-field">
        Project details
        <textarea
          name="description"
          defaultValue={initial.description}
          maxLength={10000}
        />
      </label>
      <div className="portal-grid">
        <Field
          label="Category"
          name="category"
          defaultValue={initial.category || "Photography"}
          required
        />
        <Field
          label="Agreed project price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial.price || 0}
          required
        />
        <Field
          label="Currency"
          name="currency"
          defaultValue={initial.currency || "NGN"}
          pattern="[A-Z]{3}"
          required
        />
      </div>
      <button className="primary" disabled={busy}>
        {busy
          ? "Saving…"
          : initial.id
            ? "Save project details"
            : "Create project"}
      </button>
      <p role="alert">{error}</p>
    </form>
  );
}
export default function Dashboard({ studio = false }) {
  const me = useApi("/me"),
    projects = useApi("/projects");
  const [create, setCreate] = useState(false),
    [message, setMessage] = useState("");
  const navigate = useNavigate();
  if (me.loading || projects.loading)
    return (
      <main className="portal">
        <Skeleton />
      </main>
    );
  if (me.error || projects.error)
    return (
      <main className="portal">
        <ErrorPanel
          error={me.error || projects.error}
          retry={() => {
            me.reload();
            projects.reload();
          }}
        />
      </main>
    );
  if (studio && !me.data.studio)
    return (
      <main className="portal">
        <h1>Studio access required</h1>
        <Link to="/dashboard">Your projects</Link>
      </main>
    );
  return (
    <main className="portal">
      <div className="portal-heading">
        <div>
          <p className="eyebrow">{me.data.email}</p>
          <h1>{studio ? "Studio workspace" : "Your projects"}</h1>
        </div>
        <div className="portal-actions">
          {me.data.studio && (
            <Link to={studio ? "/dashboard" : "/studio"}>
              {studio ? "Customer view" : "Studio workspace"}
            </Link>
          )}
          <button
            onClick={async () => {
              try {
                await api("/auth/logout", { method: "POST" });
                navigate("/login");
              } catch (e) {
                setMessage(e.message);
              }
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <p className="portal-intro">
        {studio
          ? "Create projects, upload files, and deliver finished work."
          : "Your photos, films, project details and agreed prices, together in one place."}
      </p>
      {studio && (
        <>
          <div className="portal-actions">
            <button className="primary" onClick={() => setCreate(!create)}>
              {create ? "Close form" : "New project"}
            </button>
            <Link to="/studio/settings">Packages & studio logo</Link>
          </div>
          {create && (
            <ProjectForm
              onSave={async (body) => {
                const p = await api("/projects", { method: "POST", body });
                navigate(`/projects/${p.id}`);
              }}
            />
          )}
        </>
      )}
      <p role="status">{message}</p>
      {!projects.data.length ? (
        <p className="portal-empty">
          No projects yet.{" "}
          {studio
            ? "Create your first customer project."
            : "The studio will invite you when your project is created."}
        </p>
      ) : (
        <div className="portal-grid">
          {projects.data.map((p) => (
            <Link className="portal-card" to={`/projects/${p.id}`} key={p.id}>
              <span className="eyebrow">
                {p.status === "ready" ? "Ready to download" : "In progress"}
              </span>
              <h2>{p.title}</h2>
              <p>{p.category}</p>
              <strong>{money(p.price, p.currency)}</strong>
              <small>
                {p.public_consent ? "Publication approved" : "Private project"}
              </small>
              <span>Open project →</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
