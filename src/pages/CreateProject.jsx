import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useApi } from "../lib/api";
import ProjectForm from "../components/ProjectForm";
import Icon from "../components/DriveIcon";
import { ErrorPanel } from "../components/PortalUI";

export default function CreateProject() {
  const me = useApi("/me");
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Create project | Hoe Studio";
  }, []);
  const shell =
    "mx-auto min-h-[75vh] max-w-6xl px-4 pb-16 pt-28 font-body text-[#241c16] sm:px-8 sm:pt-32";
  if (me.loading)
    return (
      <main
        className={shell}
        aria-busy="true"
        aria-label="Loading studio access"
      >
        <div className="mb-8 h-20 rounded-lg bg-[#e9e0d4] motion-safe:animate-pulse" />
        <div className="h-96 rounded-lg bg-[#e9e0d4] motion-safe:animate-pulse" />
      </main>
    );
  if (me.error)
    return (
      <main className={shell}>
        <ErrorPanel error={me.error} retry={me.reload} />
      </main>
    );
  if (!me.data.administrator)
    return (
      <main className={shell}>
        <h1 className="font-display text-3xl">Administrator access required</h1>
        <p className="mt-4 text-sm text-[#80705d]">
          Only studio administrators can create customer projects.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md border border-[#d8cbb8] px-4"
        >
          <Icon name="back" size={18} />
          Your projects
        </Link>
      </main>
    );
  return (
    <main className={shell}>
      <Link
        to="/studio"
        className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-[#806b51] hover:text-[#241c16]"
      >
        <Icon name="back" size={18} />
        Back to projects
      </Link>
      <header className="mb-9">
        <p className="mb-3 text-xs uppercase tracking-[.18em] text-[#967747]">
          HOE STUDIO / NEW PROJECT
        </p>
        <h1 className="font-display text-4xl sm:text-5xl">
          Start a new collection
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#80705d]">
          Set up the project, add your customer and confirm the agreed price.
          You can upload their photographs and films next.
        </p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section
          aria-labelledby="project-details"
          className="min-w-0 rounded-xl border border-[#dfd3c2] bg-[#fbf8f2] p-5 sm:p-8"
        >
          <div className="flex items-start gap-4 border-b border-[#e5d9c8] pb-6">
            <span className="rounded-md bg-[#eee2cf] p-3 text-[#987440]">
              <Icon name="folder" size={24} />
            </span>
            <div>
              <h2 id="project-details" className="font-display text-2xl">
                Project details
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#8a765e]">
                Details can be updated after you create the project.
              </p>
            </div>
          </div>
          <ProjectForm
            onSave={async (body) => {
              const created = await api("/projects", { method: "POST", body });
              navigate(`/projects/${created.id}`, { replace: true });
            }}
          />
        </section>
        <aside className="rounded-xl border border-[#dfd3c2] bg-[#f0e7d9] p-6">
          <Icon name="lock" size={23} />
          <h2 className="mt-4 font-display text-2xl">Private from the start</h2>
          <div className="my-6 h-px bg-[#dacebb]" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#806341]">
            What happens next
          </h3>
          <ol className="mt-5 space-y-5 text-sm text-[#735e46]">
            {[
              "Upload photographs and videos.",
              "Send the owner their project invitation.",
              "Review recipient access requests.",
              "Mark the collection ready and notify approved customers.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="font-display text-lg text-[#a48350]">
                  0{i + 1}
                </span>
                <span className="leading-6">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-[#dacebb] pt-5 text-xs leading-6 text-[#8b7457]">
            Creating a project does not send an email. Send the invitation from
            the project page when you are ready.
          </p>
        </aside>
      </div>
    </main>
  );
}
