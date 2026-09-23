import { AccessBadge } from "../components/ProjectSharing";
import "./Project.css";
import Icon from "../components/DriveIcon";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useApi, money } from "../lib/api";
import { ErrorPanel } from "../components/PortalUI";
export { default as ProjectForm } from "../components/ProjectForm";
const control =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d8cbb8] px-4 py-2 text-sm transition-colors hover:bg-[#eee5d7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b08a4e] disabled:opacity-50";
const roles = {
  administrator: "Studio administrator",
  manager: "Project manager",
  editor: "Editor",
  owner: "Project owner",
  recipient: "Recipient",
};
export default function Dashboard({ studio = false }) {
  const me = useApi("/me"),
    projects = useApi("/projects"),
    navigate = useNavigate();
  const [message, setMessage] = useState(""),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [sort, setSort] = useState("newest"),
    [view, setView] = useState("grid"),
    [signingOut, setSigningOut] = useState(false);
  useEffect(() => {
    document.title = `${studio ? "Studio workspace" : "Your projects"} | Hoe Studio`;
  }, [studio]);
  const shell =
    "mx-auto min-h-[75vh] max-w-[1360px] px-4 pb-16 pt-28 font-body text-[#241c16] sm:px-8 sm:pt-32 lg:px-12";
  if (me.loading || projects.loading)
    return (
      <main className={shell} aria-busy="true" aria-label="Loading projects">
        <div className="mb-8 h-24 rounded-lg bg-[#e9e0d4] motion-safe:animate-pulse" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-lg bg-[#e9e0d4] motion-safe:animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  if (me.error || projects.error)
    return (
      <main className={shell}>
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
      <main className={shell}>
        <h1 className="font-display text-3xl">Studio access required</h1>
        <Link className={`${control} mt-6`} to="/dashboard">
          Your projects
        </Link>
      </main>
    );
  const all = projects.data,
    canCreate = studio && me.data.administrator;
  const matches = (p) =>
    filter === "all" ||
    (filter === "pending"
      ? p.access?.approval === "pending"
      : filter === "ready"
        ? p.status === "ready"
        : p.status !== "ready");
  const visible = all
    .filter(
      (p) =>
        matches(p) &&
        `${p.title} ${p.category}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title)
        : new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );
  return (
    <main className={shell}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#ded4c5] pb-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e9ddc7] text-[#8d6c3d]">
            <Icon name="folder" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[.18em] text-[#8c7252]">
              HOE STUDIO
            </p>
            <p className="break-all text-sm text-[#776958]">{me.data.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {me.data.studio && (
            <Link className={control} to={studio ? "/dashboard" : "/studio"}>
              {studio ? "Customer view" : "Studio workspace"}
            </Link>
          )}
          <button
            className={control}
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              try {
                await api("/auth/logout", { method: "POST" });
                navigate("/login");
              } catch (e) {
                setMessage(e.message);
              } finally {
                setSigningOut(false);
              }
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
      <header className="mb-9 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[.16em] text-[#967747]">
            {studio ? "The studio workspace" : "Your private collection"}
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            {studio ? "Projects & deliveries" : "Your projects"}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#80705d]">
            {studio
              ? "Organize your work, manage access and deliver each collection."
              : "Your photographs, films and project details, all in one place."}
          </p>
        </div>
        {canCreate && (
          <div className="flex flex-wrap gap-2">
            <Link className={control} to="/studio/settings">
              Studio settings
            </Link>
            <button
              className={`${control} border-[#241c16] bg-[#241c16] text-[#fbf8f2] hover:bg-[#46372a]`}
              onClick={() => navigate("/studio/projects/new")}
            >
              <Icon name="plus" size={18} />
              New project
            </button>
          </div>
        )}
      </header>
      {message && (
        <p
          className="mb-5 rounded-md border border-[#d6aca0] bg-[#f4e6df] p-4 text-sm text-[#934c39]"
          role="alert"
        >
          {message}
        </p>
      )}
      {/* <section
        aria-label="Project overview"
        className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {tabs.map(([key, label, count], index) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`group rounded-lg border p-4 text-left transition-colors sm:p-5 ${filter === key ? "border-[#bca37d] bg-[#eee4d3]" : "border-[#e0d6c8] bg-[#fbf8f2] hover:border-[#bca37d]"}`}
          >
            <div className="mb-4 flex items-center justify-between gap-2 text-[#8c7250]">
              <span className="text-xs font-medium">{label}</span>
              <Icon
                name={["folder", "check", "clock", "lock"][index]}
                size={18}
              />
            </div>
            <div className="flex items-end justify-between">
              <strong className="font-display text-3xl font-normal sm:text-4xl">
                {count}
              </strong>
              <Icon name="chevron" size={16} />
            </div>
          </button>
        ))}
      </section> */}
      <section
        aria-label="Project collection"
        className="rounded-xl border border-[#e0d6c8] bg-[#fbf8f2]"
      >
        <div className="flex flex-wrap items-center gap-4 border-b border-[#e0d6c8] p-4 sm:p-6">
          <label className="flex min-h-11 w-full items-center gap-3 rounded-md border border-[#e1d7c7] bg-[#f2ece2] px-3 focus-within:border-[#a27d46] focus-within:ring-2 focus-within:ring-[#b08a4e]/15 sm:max-w-sm">
            <Icon name="search" size={18} />
            <input
              aria-label="Search projects"
              placeholder="Search by project or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
            />
            {search && (
              <button
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="p-2"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </label>
          <div className="ml-auto flex items-center gap-3">
            <select
              aria-label="Sort projects"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="min-h-11 max-w-36 rounded-md border border-[#d8cbb8] bg-transparent px-3 text-xs"
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
            </select>
            <div className="flex rounded-md border border-[#d8cbb8] p-1">
              {["grid", "list"].map((v) => (
                <button
                  key={v}
                  aria-label={`${v} view`}
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`rounded p-2 ${view === v ? "bg-[#e9ddc7]" : "hover:bg-[#f1e8da]"}`}
                >
                  <Icon name={v} size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* <div className="flex flex-wrap gap-2 px-4 pt-5 sm:px-6">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`flex min-h-10 items-center gap-3 rounded-md border px-3 py-2 text-xs ${filter === key ? "border-[#c5aa7e] bg-[#eee2cd] text-[#624724]" : "border-transparent text-[#817059] hover:bg-[#f0e8dc]"}`}
            >
              {label}
              <span className="text-[10px] opacity-70">{count}</span>
            </button>
          ))}
        </div> */}
        <div className="p-4 sm:p-6">
          <p role="status" className="mb-4 text-xs text-[#8d7c66]">
            {visible.length} {visible.length === 1 ? "project" : "projects"}
          </p>
          {!visible.length ? (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <span className="mb-5 rounded-lg bg-[#eee3d2] p-5 text-[#a07c45]">
                <Icon name={all.length ? "search" : "folder"} size={36} />
              </span>
              <h2 className="font-display text-2xl">
                {all.length
                  ? "No matching projects"
                  : "Your workspace is ready"}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#8a765e]">
                {all.length
                  ? "Try another search or choose a different filter."
                  : canCreate
                    ? "Create a project to start organizing your next delivery."
                    : "Your projects will appear here when the studio invites you."}
              </p>
              {all.length > 0 ? (
                <button
                  className={`${control} mt-6`}
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </button>
              ) : (
                canCreate && (
                  <button
                    className={`${control} mt-6`}
                    onClick={() => navigate("/studio/projects/new")}
                  >
                    Create project
                  </button>
                )
              )}
            </div>
          ) : (
            <div
              className={
                view === "grid"
                  ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid gap-3"
              }
            >
              {visible.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className={`group min-w-0 rounded-lg border border-[#e0d6c8] bg-[#fffdf9] p-6 transition-[border-color,box-shadow] hover:border-[#b69a70] hover:shadow-[0_8px_24px_-12px_#241c1625] focus-visible:outline-2 focus-visible:outline-[#b08a4e] ${view === "list" ? "flex flex-col gap-4 sm:flex-row sm:items-center" : "flex flex-col"}`}
                >
                  <div
                    className={`flex items-center justify-between gap-3 ${view === "grid" ? "mb-6" : "sm:w-44 sm:shrink-0"}`}
                  >
                    <span className="rounded-md bg-[#f0e6d6] p-3 text-[#a27e45]">
                      <Icon name="folder" size={27} />
                    </span>
                    <span
                      className={`flex items-center gap-1.5 text-xs ${p.status === "ready" ? "text-[#586d43]" : "text-[#94703c]"}`}
                    >
                      <Icon
                        name={p.status === "ready" ? "check" : "clock"}
                        size={13}
                      />
                      {p.status === "ready" ? "Ready" : "In progress"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-xs uppercase tracking-widest text-[#9b815c]">
                      {p.category}
                    </p>
                    <h2 className="break-words font-display text-2xl leading-snug">
                      {p.title}
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#88745d]">
                      <span className="flex items-center gap-1.5">
                        <Icon name="users" size={13} />
                        {roles[p.access?.role] || "Project member"}
                      </span>
                      {p.created_at && (
                        <span>
                          {new Date(p.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={
                      view === "grid"
                        ? "mt-6 border-t border-[#e9dfd1] pt-4"
                        : "sm:w-52 sm:shrink-0"
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <AccessBadge status={p.access?.approval} />
                      {p.access?.permissions?.price && (
                        <strong className="text-sm font-medium">
                          {money(p.price, p.currency)}
                        </strong>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#887258]">
                      <span className="flex items-center gap-1.5">
                        <Icon name="lock" size={12} />
                        Restricted access
                      </span>
                      <span className="flex items-center gap-1 text-[#7f5c30]">
                        Open project
                        <Icon name="chevron" size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-[#96816a]">
        <Icon name="lock" size={14} />
        <span>
          Project files require approved access. Public portfolio permission is
          managed separately inside each project.
        </span>
      </p>
    </main>
  );
}
