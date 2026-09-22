import { useRef, useState } from "react";
const inputStyle = "min-h-12 w-full rounded-md border border-[#d7c9b6] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#241c16] outline-none transition-colors focus:border-[#a27d46] focus:ring-2 focus:ring-[#b08a4e]/15 disabled:opacity-60";
function FormField({ label, ...props }) {
  return <label className="grid gap-2 text-xs font-medium text-[#66543f]"><span>{label}</span><input className={inputStyle} {...props}/></label>;
}
export default function ProjectForm({ initial = {}, onSave }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const saving = useRef(false);
  async function submit(e) {
    e.preventDefault();
    if (saving.current) return;
    saving.current = true;
    const body = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    try {
      await onSave(body);
    } catch (err) {
      setError(err.message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="mt-6 grid gap-5" onSubmit={submit}>
      <fieldset disabled={busy} className="grid min-w-0 gap-5">
      <FormField
        label="Project title"
        name="title"
        defaultValue={initial.title}
        required
        maxLength={200}
      />
      {!initial.id && (
        <FormField
          label="Customer owner email"
          name="owner_email"
          type="email"
          required
        />
      )}
      <label className="grid gap-2 text-xs font-medium text-[#66543f]">
        Project details
        <textarea
          className={`${inputStyle} min-h-28 resize-y`}
          name="description"
          defaultValue={initial.description}
          maxLength={10000}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField
          label="Category"
          name="category"
          defaultValue={initial.category || "Photography"}
          required
        />
        <FormField
          label="Agreed project price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial.price || 0}
          required
        />
        <FormField
          label="Currency"
          name="currency"
          defaultValue={initial.currency || "NGN"}
          pattern="[A-Z]{3}"
          required
        />
      </div>
      </fieldset>
      <div className="flex flex-col gap-4 border-t border-[#e0d6c8] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xs text-xs leading-5 text-[#80705d]">Project files stay private. You control who can access them.</p><button className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#241c16] px-6 py-3 text-sm font-medium text-[#fbf8f2] hover:bg-[#493929] disabled:opacity-50" disabled={busy}>
        {busy
          ? "Saving…"
          : initial.id
            ? "Save project details"
            : "Create project"}
      </button>
      </div>
      {error && <p className="rounded-md border border-[#d8afa2] bg-[#f4e6df] p-3 text-sm text-[#934c39]" role="alert">{error}</p>}
    </form>
  );
}
