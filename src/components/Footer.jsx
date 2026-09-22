import { useState } from "react";
import { Link } from "react-router-dom";
import { WhatsAppIcon, InstagramIcon } from "./Icons";

// TODO: confirm the business's real public phone number, email and Instagram handle before launch
const CONTACT = {
  whatsapp: "2348000000000",
  instagram: "https://www.instagram.com/hoemulticoncept",
  email: "hello@hoemultimediaconcept.com",
};

export default function Footer() {
  return (
    <footer className="bg-espresso text-ivory">
      {/* Newsletter band — styled per Gazmadu's "join our inner circle" pattern.
          NOTE: this form doesn't send anywhere yet — wire it up to an email
          service (Mailchimp, Buttondown, etc.) before launch. */}
      <div className="border-b border-line-light">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="eyebrow text-xs text-gold-soft mb-3">Stay in the loop</p>
          <h2 className="font-display text-3xl md:text-4xl">Join our inner circle</h2>
          <p className="mt-3 text-ivory/60 max-w-md mx-auto">
            Priority access to booking slots, behind-the-scenes and the occasional offer.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-[1.2fr_1fr_1fr] gap-10">
        <div>
          <p className="font-display text-2xl">Hoe Multimedia Concept</p>
          <p className="eyebrow text-xs text-ivory/40 mt-2">
            Ibadan, NG · Photo · Video · Live · Drone
          </p>
          <div className="flex items-center gap-5 mt-6">
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-ivory/70 hover:text-gold-soft transition-colors" aria-label="Chat on WhatsApp">
              <WhatsAppIcon />
            </a>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="text-ivory/70 hover:text-gold-soft transition-colors" aria-label="View Instagram">
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow text-[11px] text-ivory/40 mb-3">Site</p>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link to="/services" className="hover:text-gold-soft transition-colors">Services</Link></li>
            <li><Link to="/portfolio" className="hover:text-gold-soft transition-colors">Portfolio</Link></li>
            <li><Link to="/about" className="hover:text-gold-soft transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-gold-soft transition-colors">Book a session</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-[11px] text-ivory/40 mb-3">Contact</p>
          <a href={`mailto:${CONTACT.email}`} className="block text-sm text-ivory/70 hover:text-gold-soft transition-colors">
            {CONTACT.email}
          </a>
        </div>
      </div>

      <p className="text-center text-[11px] text-ivory/30 pb-8">
        © {new Date().getFullYear()} Hoe Multimedia Concept. All rights reserved.
      </p>
    <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6 text-sm"><a href="/privacy">Privacy policy</a><a href="/terms">Terms & conditions</a><a href="/login">Client sign-in</a></div></footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: connect to a real email list provider — this just confirms locally for now.
    setSent(true);
  }

  if (sent) {
    return <p className="mt-6 text-gold-soft text-sm">Thanks — you're on the list.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 bg-transparent border border-ivory/25 px-4 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold-soft transition-colors"
      />
      <button type="submit" className="px-6 py-3 bg-gold text-espresso text-sm font-medium hover:bg-gold-soft transition-colors">
        Sign up
      </button>
    </form>
  );
}
