import { useState } from "react";
import { WhatsAppIcon } from "./Icons";

// TODO: replace with the business's real public WhatsApp number (with country code, no + or spaces)
const BUSINESS_WHATSAPP = "2348000000000";

const SERVICE_OPTIONS = ["Photography", "Videography", "Livestream", "Drone service", "Not sure yet"];

const initialForm = {
  name: "",
  phone: "",
  service: SERVICE_OPTIONS[0],
  eventDate: "",
  location: "",
  message: "",
};

export default function Booking() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.phone.trim()) next.phone = "Enter a phone number.";
    if (!form.eventDate) next.eventDate = "Pick a date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const lines = [
      `New booking enquiry — ${form.service}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Event date: ${form.eventDate}`,
      form.location && `Location: ${form.location}`,
      form.message && `Details: ${form.message}`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${BUSINESS_WHATSAPP}?text=${text}`, "_blank", "noopener");
  }

  return (
    <section id="book" className="bg-ink py-24 border-t border-line">
      <div className="max-w-3xl mx-auto px-6">
        <p className="hud-label text-xs text-teal-soft mb-3">Book a shoot</p>
        <h2 className="font-display text-4xl md:text-5xl text-text-light mb-4">
          Tell us about your event.
        </h2>
        <p className="text-text-light/60 font-body mb-12">
          Fill this in and it opens a prefilled WhatsApp message straight to us
          — fastest way to get a quote.
        </p>

        <form onSubmit={handleSubmit} noValidate className="grid sm:grid-cols-2 gap-6">
          <Field label="Full name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass(errors.name)}
              placeholder="Ade Bello"
            />
          </Field>

          <Field label="Phone number" error={errors.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass(errors.phone)}
              placeholder="080..."
            />
          </Field>

          <Field label="Service">
            <select
              value={form.service}
              onChange={(e) => update("service", e.target.value)}
              className={inputClass()}
            >
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Event date" error={errors.eventDate}>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
              className={inputClass(errors.eventDate)}
            />
          </Field>

          <Field label="Location" className="sm:col-span-2">
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className={inputClass()}
              placeholder="Venue or address"
            />
          </Field>

          <Field label="Details" className="sm:col-span-2">
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={4}
              className={inputClass()}
              placeholder="Tell us a bit about the shoot..."
            />
          </Field>

          <button
            type="submit"
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 mt-2 px-6 py-3 bg-amber text-ink font-body font-semibold hover:bg-amber-soft transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Send enquiry on WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}

function inputClass(error) {
  return [
    "w-full bg-ink-2 border px-4 py-3 text-text-light font-body placeholder:text-text-light/30",
    "focus:outline-none focus:border-amber transition-colors",
    error ? "border-amber-soft" : "border-line",
  ].join(" ");
}

function Field({ label, error, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="hud-label text-[11px] text-text-light/50">{label}</span>
      {children}
      {error && <span className="text-xs text-amber-soft font-body">{error}</span>}
    </label>
  );
}
