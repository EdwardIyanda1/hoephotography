import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, useApi, money } from "../lib/api";
import { Skeleton, ErrorPanel, Field, MediaView } from "../components/PortalUI";
import { ProjectForm } from "./Dashboard";
import PhotoEditor from "../components/PhotoEditor";
function MediaEditor({ media, base, run }) {
  const [caption, setCaption] = useState(media.caption),
    [featured, setFeatured] = useState(media.featured);
  return (
    <div className="portal-card">
      <Field
        label="Caption / alternative text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />{" "}
        Select for public portfolio (requires customer consent)
      </label>
      <div className="portal-actions">
        <button
          onClick={() =>
            run(() =>
              api(`${base}/media/${media.id}`, {
                method: "PATCH",
                body: { caption, featured },
              }),
            )
          }
        >
          Save media details
        </button>
        <button
          onClick={() => {
            if (window.confirm("Delete this file permanently?"))
              run(() => api(`${base}/media/${media.id}`, { method: "DELETE" }));
          }}
        >
          Delete file
        </button>
      </div>
    </div>
  );
}
export default function Project() {
  const { id } = useParams(),
    base = `/projects/${id}`;
  const state = useApi(base),
    me = useApi("/me");
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [editing, setEditing] = useState(false),
    [photo, setPhoto] = useState(null),
    [progress, setProgress] = useState("");
  async function run(task) {
    setBusy(true);
    setMessage("");
    try {
      const result = await task();
      setMessage(result?.message || "Saved.");
      state.reload();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file) {
    const ticket = await api(`${base}/uploads`, {
      method: "POST",
      body: { name: file.name, mime: file.type, bytes: file.size },
    });
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", ticket.uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          setProgress(
            `${file.name}: ${Math.round((e.loaded / e.total) * 100)}%`,
          );
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed (${xhr.status}). Try again.`));
      xhr.onerror = () =>
        reject(new Error("Upload connection failed. Try again."));
      xhr.send(file);
    });
    setProgress("");
  }
  if (state.loading || me.loading)
    return (
      <main className="portal">
        <Skeleton />
      </main>
    );
  if (state.error || me.error)
    return (
      <main className="portal">
        <ErrorPanel
          error={state.error || me.error}
          retry={() => {
            state.reload();
            me.reload();
          }}
        />
      </main>
    );
  const p = state.data,
    isStudio = me.data.studio,
    isOwner = me.data.email === p.owner_email;
  return (
    <main className="portal">
      <Link to={isStudio ? "/studio" : "/dashboard"}>← All projects</Link>
      <div className="portal-heading">
        <div>
          <p className="eyebrow">
            {p.category} · {p.status}
          </p>
          <h1>{p.title}</h1>
        </div>
        <strong>{money(p.price, p.currency)}</strong>
      </div>
      <p className="portal-intro whitespace-pre-wrap">{p.description}</p>
      <p>
        {p.public_consent
          ? "Customer has approved selected files for the public portfolio."
          : "Private: these files are only available to permitted recipients and the studio."}
      </p>
      <p className="portal-message" role="status">
        {busy ? "Working… " : ""}
        {progress || message}
      </p>
      {isStudio && (
        <>
          <fieldset disabled={busy}>
            <div className="portal-actions">
              <button
                onClick={() =>
                  run(async () => {
                    await navigator.clipboard.writeText(location.href);
                    return {
                      message: "Project link copied. Recipients must sign in.",
                    };
                  })
                }
              >
                Copy project link
              </button>
              <button
                onClick={() =>
                  run(() => api(`${base}/invite`, { method: "POST" }))
                }
              >
                Email owner invitation
              </button>
              <button onClick={() => setEditing(!editing)}>
                Edit project & price
              </button>
              <button
                className="primary"
                onClick={() =>
                  run(() => api(`${base}/ready`, { method: "POST" }))
                }
              >
                {p.status === "ready"
                  ? "Retry unsent ready emails"
                  : "Mark ready & email customers"}
              </button>
            </div>
            {editing && (
              <ProjectForm
                initial={p}
                onSave={async (body) => {
                  await api(base, { method: "PATCH", body });
                  state.reload();
                  setEditing(false);
                }}
              />
            )}
            <section className="portal-card">
              <h2>Upload photos & videos</h2>
              <p>
                Choose multiple files for upload, or edit a photo before
                uploading. Videos are uploaded as supplied.
              </p>
              <label className="portal-field">
                Upload original files
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={(e) => {
                    const files = [...e.target.files];
                    e.target.value = "";
                    run(async () => {
                      for (const file of files) await upload(file);
                      return { message: `${files.length} file(s) uploaded.` };
                    });
                  }}
                />
              </label>
              <label className="portal-field">
                Edit a photo before upload
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    setPhoto(e.target.files[0] || null);
                    e.target.value = "";
                  }}
                />
              </label>
            </section>
          </fieldset>
          {photo && (
            <PhotoEditor
              file={photo}
              onCancel={() => setPhoto(null)}
              onSave={(file) =>
                run(async () => {
                  await upload(file);
                  setPhoto(null);
                })
              }
              busy={busy}
            />
          )}
        </>
      )}
      {isOwner && (
        <section className="portal-card">
          <h2>
            {p.registered
              ? "Permitted recipients"
              : "Complete your project registration"}
          </h2>
          <p>
            Register two or three email addresses including your own. Each
            recipient verifies their email to access this project. Removing an
            address removes its project access.
          </p>
          <form
            key={p.members.join(",")}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              run(() =>
                api(`${base}/members`, {
                  method: "PUT",
                  body: {
                    emails: [
                      p.owner_email,
                      form.get("second"),
                      form.get("third"),
                    ].filter(Boolean),
                  },
                }),
              );
            }}
          >
            <div className="portal-grid">
              <Field
                label="Your verified owner email"
                value={p.owner_email}
                readOnly
              />
              <Field
                label="Second permitted email"
                name="second"
                type="email"
                defaultValue={p.members.filter((x) => x !== p.owner_email)[0]}
                required
              />
              <Field
                label="Third permitted email (optional)"
                name="third"
                type="email"
                defaultValue={p.members.filter((x) => x !== p.owner_email)[1]}
              />
            </div>
            <button disabled={busy} className="primary">
              Save permitted emails
            </button>
          </form>
          <hr />
          <h3>Portfolio permission</h3>
          <p>
            Allow the studio to publish selected photos or videos on its public
            website. Your project price and recipient emails remain private. You
            can withdraw permission here.
          </p>
          <label>
            <input
              disabled={busy}
              type="checkbox"
              checked={p.public_consent}
              onChange={(e) =>
                run(() =>
                  api(`${base}/privacy`, {
                    method: "PUT",
                    body: { public_consent: e.target.checked },
                  }),
                )
              }
            />{" "}
            I allow selected files from this project to be published.
          </label>
        </section>
      )}
      <section>
        <h2 className="portal-section-title">
          Project files <span>({p.media.length})</span>
        </h2>
        {!p.media.length ? (
          <p className="portal-empty">The studio has not uploaded files yet.</p>
        ) : (
          <div className="portal-grid">
            {p.media.map((m) => (
              <article className="media-card" key={m.id}>
                <MediaView media={m} />
                <div className="media-caption">
                  <h3>{m.caption || m.name}</h3>
                  <small>{(Number(m.bytes) / 1048576).toFixed(1)} MB</small>
                  <a
                    href={`${m.url}?download=1`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download original ↗
                  </a>
                </div>
                {isStudio && (
                  <fieldset disabled={busy}>
                    <MediaEditor media={m} base={base} run={run} />
                  </fieldset>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
