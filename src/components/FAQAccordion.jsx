import { useState } from "react";

// NOTE: a couple of answers below have a [CONFIRM] tag on specific numbers
// (deposit %, turnaround time) — these are drafted as reasonable defaults,
// not confirmed business policy. Get sign-off from the client before publishing.
const FAQS = [
  {
    q: "How do I book a session?",
    a: "Fill in the form above and it opens a WhatsApp message straight to us with your details. We'll follow up to confirm availability and next steps.",
  },
  {
    q: "Do I need to pay a deposit?",
    a: "Yes — a deposit secures your date [CONFIRM: amount or %], with the balance due on or before the shoot date.",
  },
  {
    q: "How long before I get my photos or video?",
    a: "Turnaround is typically [CONFIRM: X business days], depending on the size of the shoot. We'll confirm a delivery date when we book.",
  },
  {
    q: "Do you travel outside Ibadan?",
    a: "Yes, we're available for events and shoots across Nigeria — just mention your location in the enquiry so we can plan travel.",
  },
  {
    q: "Can you combine photography, video and livestream in one booking?",
    a: "Yes, most weddings and events run all three together — mention what you need in the enquiry and we'll put together a plan.",
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-line">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-display text-lg text-espresso">{item.q}</span>
              <span className={`text-rose text-xl transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
            </button>
            {isOpen && (
              <p className="pb-5 text-espresso/65 text-sm leading-relaxed max-w-xl">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
