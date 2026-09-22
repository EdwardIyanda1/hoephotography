import { useState } from "react";
import { Link } from "react-router-dom";
import { api, useApi, money } from "../lib/api";
import { Skeleton, ErrorPanel, Field } from "../components/PortalUI";
export default function StudioSettings() {
  const me = useApi("/me"),
    packages = useApi("/studio/packages"),
    settings = useApi("/public/settings");
  const [edit, setEdit] = useState(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function run(fn) {
    setBusy(true);
    try {
      await fn();
      setMessage("Saved.");
      packages.reload();
      settings.reload();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (me.loading || packages.loading || settings.loading)
    return (
      <main className="portal">
        <Skeleton />
      </main>
    );
  if (me.error || packages.error || settings.error)
    return (
      <main className="portal">
        <ErrorPanel
          error={me.error || packages.error || settings.error}
          retry={() => {
            me.reload();
            packages.reload();
            settings.reload();
          }}
        />
      </main>
    );
  return (
    <main className="portal">
      <Link to="/studio">← Studio workspace</Link>
      <h1>Packages & studio logo</h1>
      <p role="status">{message}</p>
      <fieldset disabled={busy}>
        <form
          className="portal-card"
          onSubmit={(e) => {
            e.preventDefault();
            const body = Object.fromEntries(new FormData(e.currentTarget));
            run(() => api("/studio/settings", { method: "PUT", body }));
          }}
        >
          <h2>Real studio logo</h2>
          <p>
            Use the HTTPS URL of your studio’s logo. This appears as an image in
            the navbar.
          </p>
          <Field
            label="Logo image URL"
            name="logo_url"
            type="url"
            defaultValue={settings.data?.logo_url}
            required
          />
          <button className="primary">Save logo</button>
        </form>
        <div className="portal-heading">
          <h2>Published packages</h2>
          <button onClick={() => setEdit({ id: crypto.randomUUID() })}>
            Add package
          </button>
        </div>
        {edit && (
          <form
            key={edit.id}
            className="portal-card"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                body = { ...Object.fromEntries(f), active: f.has("active") };
              run(async () => {
                await api(`/studio/packages/${edit.id}`, {
                  method: "PUT",
                  body,
                });
                setEdit(null);
              });
            }}
          >
            <Field
              name="name"
              label="Package name"
              defaultValue={edit.name}
              required
            />
            <Field
              name="category"
              label="Category (use Wedding for wedding packages)"
              defaultValue={edit.category || "Photography"}
              required
            />
            <label className="portal-field">
              Description
              <textarea name="description" defaultValue={edit.description} />
            </label>
            <Field
              name="price"
              label="Price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={edit.price || 0}
              required
            />
            <Field
              name="currency"
              label="Currency"
              pattern="[A-Z]{3}"
              defaultValue={edit.currency || "NGN"}
              required
            />
            <label>
              <input
                name="active"
                type="checkbox"
                defaultChecked={edit.active !== false}
              />{" "}
              Published
            </label>
            <div className="portal-actions">
              <button className="primary">Save package</button>
              <button type="button" onClick={() => setEdit(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        <div className="portal-grid">
          {packages.data.map((p) => (
            <article className="portal-card" key={p.id}>
              <h3>{p.name}</h3>
              <p>
                {money(p.price, p.currency)} ·{" "}
                {p.active ? "Published" : "Hidden"}
              </p>
              <button onClick={() => setEdit(p)}>Edit package</button>
            </article>
          ))}
        </div>
      </fieldset>
    </main>
  );
}
