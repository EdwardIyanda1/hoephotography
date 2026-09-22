import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, useApi, money } from "../lib/api";
import { ErrorPanel } from "../components/PortalUI";
import Icon from "../components/DriveIcon";
import Dialog from "../components/DriveDialog";
import Sharing, { AccessBadge } from "../components/ProjectSharing";
import PhotoEditor from "../components/PhotoEditor";
import { ProjectForm } from "./Dashboard";
import "./Project.css";
const size = (n) =>
  Number(n) >= 1048576
    ? `${(Number(n) / 1048576).toFixed(1)} MB`
    : `${Math.max(0, Math.round(Number(n) / 1024))} KB`;
const date = (s) =>
  s
    ? new Date(s).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not recorded";
function Loading() {
  return (
    <main className="drive-page" aria-busy="true">
      <div className="d-loading-top" />
      <div className="d-loading-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} />
        ))}
      </div>
      <span className="sr-only">Loading project files</span>
    </main>
  );
}
function FileDetails({ file: m, perm, run, base, busy, onPreview }) {
  const [caption, setCaption] = useState(m.caption),
    [featured, setFeatured] = useState(m.featured);
  return (
    <>
      <div className="d-detail-art">
        {m.mime.startsWith("image/") ? (
          <img src={m.url} alt={m.caption || m.name} />
        ) : (
          <Icon name="video" size={55} />
        )}
      </div>
      <h3 className="d-filename">{m.name}</h3>
      <dl className="d-properties">
        <dt>Type</dt>
        <dd>{m.mime.split("/")[1].toUpperCase()}</dd>
        <dt>Size</dt>
        <dd>{size(m.bytes)}</dd>
        <dt>Uploaded</dt>
        <dd>{date(m.created_at)}</dd>
        <dt>Portfolio selection</dt>
        <dd>{m.featured ? "Selected" : "Not selected"}</dd>
      </dl>
      <button className="d-secondary" onClick={onPreview}>
        <Icon name="eye" />
        Open preview
      </button>
      {perm.download && (
        <a className="d-secondary" href={`${m.url}?download=1`}>
          <Icon name="download" />
          Download original
        </a>
      )}
      {perm.caption && (
        <form
          className="d-form"
          onSubmit={(e) => {
            e.preventDefault();
            run(() =>
              api(`${base}/media/${m.id}`, {
                method: "PATCH",
                body: { caption, ...(perm.feature ? { featured } : {}) },
              }),
            );
          }}
        >
          <label>
            Caption
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2000}
            />
          </label>
          {perm.feature && (
            <label className="d-check">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Select for public portfolio
            </label>
          )}
          <button className="d-primary" disabled={busy}>
            Save changes
          </button>
        </form>
      )}
      {perm.delete && (
        <button
          className="d-danger"
          disabled={busy}
          onClick={() => {
            if (window.confirm(`Permanently delete ${m.name}?`))
              run(() => api(`${base}/media/${m.id}`, { method: "DELETE" }));
          }}
        >
          <Icon name="trash" />
          Delete file
        </button>
      )}
    </>
  );
}
function Activity({ base }) {
  const state = useApi(`${base}/audit`);
  if (state.loading) return <p>Loading activity…</p>;
  if (state.error)
    return <ErrorPanel error={state.error} retry={state.reload} />;
  return (
    <ol className="d-activity">
      {state.data.map((e, i) => (
        <li key={i}>
          <Icon name="clock" />
          <div>
            <strong>{e.action.replaceAll(".", " ")}</strong>
            <p>{e.subject || e.actor}</p>
            <small>
              {date(e.created_at)} · {e.actor}
            </small>
          </div>
        </li>
      ))}
    </ol>
  );
}
export default function Project() {
  const { id } = useParams(),
    base = `/projects/${id}`,
    state = useApi(base),
    me = useApi("/me");
  const [view, setView] = useState("grid"),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("newest"),
    [selected, setSelected] = useState(null),
    [details, setDetails] = useState(true),
    [dialog, setDialog] = useState(null),
    [preview, setPreview] = useState(null),
    [photo, setPhoto] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [failure, setFailure] = useState(false),
    [progress, setProgress] = useState(null);
  const uploadRef = useRef(null),
    editRef = useRef(null);
  useEffect(() => {
    document.title = `${state.data?.title || "Project"} | Hoe Studio`;
  }, [state.data?.title]);
  const reload = state.reload;
  useEffect(() => {
    const refresh = () => reload();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [reload]);
  async function run(task) {
    setBusy(true);
    setMessage("");
    setFailure(false);
    try {
      const r = await task();
      setMessage(r?.message || "Changes saved.");
      state.reload();
      return true;
    } catch (e) {
      setFailure(true);
      setMessage(e.message);
      return false;
    } finally {
      setBusy(false);
      setProgress(null);
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
      xhr.timeout = 600000;
      xhr.upload.onprogress = (e) =>
        setProgress({
          name: file.name,
          value: e.lengthComputable
            ? Math.round((e.loaded / e.total) * 100)
            : 0,
        });
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else {
          let text = "Upload failed. Please try again.";
          try {
            text = JSON.parse(xhr.responseText).error || text;
          } catch {
            /* non-JSON proxy failure */
          }
          reject(new Error(text));
        }
      };
      xhr.onerror = () => reject(new Error("Upload connection failed."));
      xhr.ontimeout = () => reject(new Error("Upload timed out."));
      xhr.send(file);
    });
  }
  if (state.loading || me.loading) return <Loading />;
  if (state.error || me.error)
    return (
      <main className="drive-page">
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
    perm = p.access.permissions,
    files = p.media,
    chosen = files.find((m) => m.id === selected),
    previewFile = files.find((m) => m.id === preview);
  const filtered = files
    .filter(
      (m) =>
        (filter === "all" ||
          (filter === "photos"
            ? m.mime.startsWith("image/")
            : m.mime.startsWith("video/"))) &&
        `${m.name} ${m.caption}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "size"
          ? Number(b.bytes) - Number(a.bytes)
          : new Date(b.created_at) - new Date(a.created_at),
    );
  const photos = files.filter((m) => m.mime.startsWith("image/")).length,
    videos = files.length - photos,
    approved = p.member_access.filter((m) => m.approval === "approved").length;
  const shareLink = () =>
    run(async () => {
      await navigator.clipboard.writeText(`${location.origin}/projects/${id}`);
      return {
        message:
          "Project link copied. Access still requires approval and sign-in.",
      };
    });
  return (
    <main className="drive-page">
      <aside className="d-sidebar">
        <Link className="d-back" to={me.data.studio ? "/studio" : "/dashboard"}>
          <Icon name="back" />
          All projects
        </Link>
        <div className="d-space">
          <span className="d-space-icon">
            <Icon name="folder" size={27} />
          </span>
          <div>
            <strong>Project space</strong>
            <small>HOE MULTIMEDIA</small>
          </div>
        </div>
        {perm.upload ? (
          <button
            className="d-primary d-upload"
            disabled={busy}
            onClick={() => setDialog("upload")}
          >
            <Icon name="plus" />
            Upload files
          </button>
        ) : (
          <div className="d-client-access">
            <Icon name="lock" />
            <span>
              {p.access.role === "owner" ? "Owner access" : "Recipient access"}
            </span>
          </div>
        )}
        <nav aria-label="Project file categories">
          {[
            ["all", "folder", "All files", files.length],
            ["photos", "image", "Photos", photos],
            ["videos", "video", "Videos", videos],
          ].map(([key, icon, title, count]) => (
            <button
              key={key}
              className={filter === key ? "active" : ""}
              aria-pressed={filter === key}
              onClick={() => {
                setFilter(key);
                setSelected(null);
              }}
            >
              <Icon name={icon} />
              <span>{title}</span>
              <small>{count}</small>
            </button>
          ))}
          <button onClick={() => setDialog("share")}>
            <Icon name="users" />
            <span>Sharing & access</span>
          </button>
          {perm.audit && (
            <button onClick={() => setDialog("activity")}>
              <Icon name="clock" />
              <span>Activity</span>
            </button>
          )}
        </nav>
        <div className="d-sidebar-bottom">
          <Icon name="lock" />
          <strong>Private by default</strong>
          <p>You choose who can access your project.</p>
          <span>
            {size(files.reduce((n, m) => n + Number(m.bytes), 0))} in this
            project
          </span>
        </div>
      </aside>
      <section className="d-workspace">
        <div className="d-topbar">
          <label className="d-search">
            <Icon name="search" />
            <input
              placeholder="Search this project"
              aria-label="Search files"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button aria-label="Clear search" onClick={() => setSearch("")}>
                <Icon name="close" size={16} />
              </button>
            )}
          </label>
          <button
            className="d-avatar d-self"
            title={me.data.email}
            aria-label="Your project access"
            onClick={() => setDialog("share")}
          >
            {me.data.email[0].toUpperCase()}
          </button>
        </div>
        <div className="d-project-header">
          <div>
            <div className="d-breadcrumb">
              <Link to={me.data.studio ? "/studio" : "/dashboard"}>
                My projects
              </Link>
              <Icon name="chevron" size={13} />
              <span>{p.category}</span>
            </div>
            <h1>{p.title}</h1>
            <div className="d-subtitle">
              <span
                className={`d-delivery ${p.status === "ready" ? "ready" : ""}`}
              >
                <Icon
                  name={p.status === "ready" ? "check" : "clock"}
                  size={14}
                />
                {p.status === "ready" ? "Ready for delivery" : "In progress"}
              </span>
              <span className="d-divider" />
              <Icon name="lock" size={14} />
              <span>Restricted access</span>
            </div>
          </div>
          <button className="d-primary" onClick={() => setDialog("share")}>
            <Icon name="users" size={18} />
            Share
          </button>
        </div>
        {message && (
          <div
            className={`d-notice ${failure ? "error" : ""}`}
            role={failure ? "alert" : "status"}
          >
            <Icon name={failure ? "info" : "check"} size={18} />
            <span>{message}</span>
            <button
              className="d-icon"
              aria-label="Dismiss message"
              onClick={() => setMessage("")}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        {progress && (
          <div className="d-progress" role="status">
            <span>Uploading {progress.name}</span>
            <strong>{progress.value}%</strong>
            <progress max="100" value={progress.value} />
          </div>
        )}
        {!perm.files ? (
          <div className="d-pending">
            <Icon name="lock" size={42} />
            <h2>Project access {p.access.approval}</h2>
            <p>
              Your email is verified. The studio must approve your access before
              you can view or download these files.
            </p>
            <AccessBadge status={p.access.approval} />
            <button className="d-secondary" onClick={state.reload}>
              Check approval status
            </button>
          </div>
        ) : (
          <>
            <div className="d-toolbar">
              <div className="d-filter-buttons">
                {[
                  ["all", "All files"],
                  ["photos", "Photos"],
                  ["videos", "Videos"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    className={filter === key ? "active" : ""}
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="d-view-tools">
                <select
                  aria-label="Sort files"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="name">Name A–Z</option>
                  <option value="size">Largest first</option>
                </select>
                <div className="d-toggle">
                  <button
                    className={view === "list" ? "active" : ""}
                    aria-label="List view"
                    aria-pressed={view === "list"}
                    onClick={() => setView("list")}
                  >
                    <Icon name="list" />
                  </button>
                  <button
                    className={view === "grid" ? "active" : ""}
                    aria-label="Grid view"
                    aria-pressed={view === "grid"}
                    onClick={() => setView("grid")}
                  >
                    <Icon name="grid" />
                  </button>
                </div>
                <button
                  className={`d-icon ${details ? "active" : ""}`}
                  aria-label="Toggle details"
                  aria-pressed={details}
                  onClick={() => setDetails(!details)}
                >
                  <Icon name="info" />
                </button>
              </div>
            </div>
            <div className={`d-content ${details ? "with-details" : ""}`}>
              <div className="d-files">
                <div className="d-files-heading">
                  <h2>
                    {filter === "photos"
                      ? "Photos"
                      : filter === "videos"
                        ? "Videos"
                        : "Project files"}
                  </h2>
                  <span>
                    {filtered.length} {filtered.length === 1 ? "file" : "files"}
                  </span>
                </div>
                {!filtered.length ? (
                  <div className="d-empty">
                    <Icon name={search ? "search" : "folder"} size={43} />
                    <h3>
                      {search
                        ? "No matching files"
                        : "Your files will appear here"}
                    </h3>
                    <p>
                      {search
                        ? "Try a different name or clear the filters."
                        : perm.upload
                          ? "Upload your first photo or video to this project."
                          : "The studio will add your photos and videos here."}
                    </p>
                    {perm.upload && !search && (
                      <button
                        className="d-secondary"
                        onClick={() => setDialog("upload")}
                      >
                        Upload files
                      </button>
                    )}
                  </div>
                ) : view === "grid" ? (
                  <div className="d-file-grid">
                    {filtered.map((m) => (
                      <article
                        key={m.id}
                        className={`d-file-card ${selected === m.id ? "selected" : ""}`}
                      >
                        <button
                          className="d-file-select"
                          aria-label={`Select ${m.name}`}
                          aria-pressed={selected === m.id}
                          onClick={() => {
                            setSelected(m.id);
                            setDetails(true);
                          }}
                          onDoubleClick={() => setPreview(m.id)}
                        >
                          <div className="d-card-preview">
                            {m.mime.startsWith("image/") ? (
                              <img
                                loading="lazy"
                                src={m.url}
                                alt={m.caption || m.name}
                              />
                            ) : (
                              <div className="d-video-placeholder">
                                <Icon name="video" size={48} />
                                <span>
                                  {m.mime.split("/")[1].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="d-type-mark">
                              <Icon
                                name={
                                  m.mime.startsWith("image/")
                                    ? "image"
                                    : "video"
                                }
                                size={14}
                              />
                            </span>
                          </div>
                          <div className="d-card-title">
                            <Icon
                              name={
                                m.mime.startsWith("image/") ? "image" : "video"
                              }
                              size={17}
                            />
                            <strong>{m.name}</strong>
                          </div>
                          <div className="d-card-meta">
                            <span>{size(m.bytes)}</span>
                            <span>{date(m.created_at)}</span>
                          </div>
                        </button>
                        <button
                          className="d-preview-action"
                          onClick={() => setPreview(m.id)}
                          aria-label={`Preview ${m.name}`}
                        >
                          <Icon name="eye" size={16} />
                          Preview
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="d-table-wrap">
                    <table className="d-file-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Uploaded</th>
                          <th>Size</th>
                          <th>
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((m) => (
                          <tr
                            key={m.id}
                            className={selected === m.id ? "selected" : ""}
                          >
                            <td>
                              <button
                                onClick={() => {
                                  setSelected(m.id);
                                  setDetails(true);
                                }}
                              >
                                <Icon
                                  name={
                                    m.mime.startsWith("image/")
                                      ? "image"
                                      : "video"
                                  }
                                />
                                <span>{m.name}</span>
                              </button>
                            </td>
                            <td>{date(m.created_at)}</td>
                            <td>{size(m.bytes)}</td>
                            <td>
                              <button
                                className="d-icon"
                                aria-label={`Preview ${m.name}`}
                                onClick={() => setPreview(m.id)}
                              >
                                <Icon name="eye" size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="d-file-footnote">
                  <Icon name="lock" size={13} />
                  Files are available only to approved people on this project.
                </p>
              </div>
              {details && (
                <aside className="d-details">
                  <div className="d-details-heading">
                    <h2>{chosen ? "File details" : "Project details"}</h2>
                    <button
                      className="d-icon"
                      onClick={() => setDetails(false)}
                      aria-label="Close details"
                    >
                      <Icon name="close" size={17} />
                    </button>
                  </div>
                  {chosen ? (
                    <>
                      <button
                        className="d-text-button"
                        onClick={() => setSelected(null)}
                      >
                        Back to project details
                      </button>
                      <FileDetails
                        key={chosen.id}
                        file={chosen}
                        perm={perm}
                        run={run}
                        base={base}
                        busy={busy}
                        onPreview={() => setPreview(chosen.id)}
                      />
                    </>
                  ) : (
                    <>
                      <div className="d-project-folder">
                        <Icon name="folder" size={58} />
                      </div>
                      <h3>{p.title}</h3>
                      <p className="d-description">
                        {p.description || "No additional project details yet."}
                      </p>
                      <dl className="d-properties">
                        <dt>Category</dt>
                        <dd>{p.category}</dd>
                        <dt>Created</dt>
                        <dd>{date(p.created_at)}</dd>
                        <dt>Files</dt>
                        <dd>
                          {photos} photos · {videos} videos
                        </dd>
                        {perm.price && (
                          <>
                            <dt>Project price</dt>
                            <dd className="d-price">
                              {money(p.price, p.currency)}
                            </dd>
                          </>
                        )}
                      </dl>
                      <div className="d-detail-sharing">
                        <h4>People & permissions</h4>
                        <p>
                          {perm.approve || perm.recipients
                            ? `${approved} approved · ${p.member_access.filter((m) => m.approval === "pending").length} pending`
                            : "Your access to this project"}
                        </p>
                        <AccessBadge status={p.access.approval} />
                        <button
                          className="d-text-button"
                          onClick={() => setDialog("share")}
                        >
                          Manage sharing <Icon name="chevron" size={14} />
                        </button>
                      </div>
                      <div className="d-detail-actions">
                        {perm.edit && (
                          <button
                            className="d-secondary"
                            onClick={() => setDialog("edit")}
                          >
                            <Icon name="edit" size={17} />
                            Edit project
                          </button>
                        )}
                        {perm.invite && (
                          <button
                            disabled={busy}
                            className="d-secondary"
                            onClick={() =>
                              run(() =>
                                api(`${base}/invite`, { method: "POST" }),
                              )
                            }
                          >
                            Email owner invitation
                          </button>
                        )}
                        {perm.ready && (
                          <button
                            disabled={busy}
                            className="d-primary"
                            onClick={() =>
                              run(() =>
                                api(`${base}/ready`, { method: "POST" }),
                              )
                            }
                          >
                            <Icon name="check" size={17} />
                            {p.status === "ready"
                              ? "Retry unsent emails"
                              : "Mark ready & notify"}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </aside>
              )}
            </div>
          </>
        )}
      </section>
      <input
        ref={uploadRef}
        type="file"
        hidden
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        onChange={(e) => {
          const chosen = [...e.target.files];
          e.target.value = "";
          setDialog(null);
          if (chosen.length)
            run(async () => {
              for (const file of chosen) await upload(file);
              return { message: `${chosen.length} file(s) uploaded.` };
            });
        }}
      />
      <input
        ref={editRef}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          setPhoto(e.target.files[0] || null);
          e.target.value = "";
          setDialog(null);
        }}
      />
      {dialog === "share" && (
        <Dialog title="Share project" onClose={() => setDialog(null)}>
          <Sharing
            key={p.member_access
              .map((m) => m.email + m.approval + m.role)
              .join()}
            project={p}
            busy={busy}
            run={run}
          />
          <footer>
            <button className="d-secondary" onClick={shareLink}>
              <Icon name="link" size={17} />
              Copy link
            </button>
            <button className="d-primary" onClick={() => setDialog(null)}>
              Done
            </button>
          </footer>
          {message && (
            <p className={failure ? "d-error" : "d-muted"} role="status">
              {message}
            </p>
          )}
        </Dialog>
      )}
      {dialog === "upload" && (
        <Dialog
          title="Add files to your project"
          onClose={() => setDialog(null)}
        >
          <div className="d-upload-choices">
            <button disabled={busy} onClick={() => uploadRef.current.click()}>
              <Icon name="upload" size={32} />
              <strong>Upload photos & videos</strong>
              <span>Select one or more files from your device.</span>
            </button>
            <button disabled={busy} onClick={() => editRef.current.click()}>
              <Icon name="edit" size={32} />
              <strong>Edit a photo first</strong>
              <span>Crop, rotate and adjust before uploading.</span>
            </button>
          </div>
        </Dialog>
      )}
      {dialog === "edit" && (
        <Dialog
          title="Edit project details"
          onClose={() => setDialog(null)}
          wide
        >
          <ProjectForm
            initial={p}
            onSave={async (body) => {
              await api(base, { method: "PATCH", body });
              state.reload();
              setDialog(null);
            }}
          />
        </Dialog>
      )}
      {dialog === "activity" && (
        <Dialog title="Project activity" onClose={() => setDialog(null)}>
          <Activity base={base} />
        </Dialog>
      )}
      {photo && (
        <Dialog
          title="Photo editor"
          wide
          onClose={() => {
            if (!busy) setPhoto(null);
          }}
        >
          <PhotoEditor
            file={photo}
            busy={busy}
            onCancel={() => setPhoto(null)}
            onSave={(file) =>
              run(async () => {
                await upload(file);
                setPhoto(null);
              })
            }
          />
          {failure && (
            <p className="d-error" role="alert">
              {message}
            </p>
          )}
        </Dialog>
      )}
      {previewFile && perm.files && (
        <Dialog title={previewFile.name} wide onClose={() => setPreview(null)}>
          <div className="d-full-preview">
            {previewFile.mime.startsWith("image/") ? (
              <img
                src={previewFile.url}
                alt={previewFile.caption || previewFile.name}
              />
            ) : (
              <video controls autoPlay={false} src={previewFile.url} />
            )}
          </div>
          <footer>
            <span>{previewFile.caption || size(previewFile.bytes)}</span>
            <a className="d-primary" href={`${previewFile.url}?download=1`}>
              <Icon name="download" size={18} />
              Download original
            </a>
          </footer>
        </Dialog>
      )}
    </main>
  );
}
