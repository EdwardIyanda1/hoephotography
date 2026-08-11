import { Link } from "react-router-dom";
import { CameraIcon, VideoIcon, LiveIcon, DroneIcon } from "../components/Icons";
import Reveal from "../components/Reveal";

const SERVICES = [
  {
    tag: "Portraits",
    title: "Photography",
    Icon: CameraIcon,
    desc: "Portraits, weddings, events, product shoots and real estate — shot with intention, edited and delivered within days.",
    includes: ["Full-day or half-day coverage", "Professionally retouched gallery", "High-res digital delivery", "Print-ready files on request"],
  },
  {
    tag: "Documentary",
    title: "Videography",
    Icon: VideoIcon,
    desc: "Honest, cinematic coverage for weddings and brand films, plus tight highlight reels built for how people actually watch.",
    includes: ["Multi-camera event coverage", "Color-graded final edit", "Short-form highlight reel", "Raw footage on request"],
  },
  {
    tag: "Live",
    title: "Livestream",
    Icon: LiveIcon,
    desc: "Multi-camera livestreaming for weddings, church services and conferences, pushed simultaneously to YouTube, Facebook and Instagram.",
    includes: ["Multi-camera live switching", "Simultaneous multi-platform push", "On-site technical support", "Recording archived after the stream"],
  },
  {
    tag: "Drone",
    title: "Drone Service",
    Icon: DroneIcon,
    desc: "Licensed aerial photography and video — property walkthroughs, event establishing shots and landscape work.",
    includes: ["Aerial photo & video capture", "Property flythroughs", "Event establishing shots", "Licensed, insured pilots"],
  },
];

export default function Services() {
  return (
    <div className="bg-ivory">
      <section className="pt-40 pb-16 max-w-6xl mx-auto px-6 text-center">
        <p className="eyebrow text-xs text-rose mb-3">Services</p>
        <h1 className="font-display text-5xl md:text-6xl text-espresso max-w-2xl mx-auto">
          Everything a shoot needs, one crew.
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-espresso/60">
          Pick one service or combine them — most weddings and events run
          photography, video and livestream together.
        </p>
      </section>

      <div>
        {SERVICES.map(({ tag, title, Icon, desc, includes }, i) => (
          <section key={title} className={`py-20 border-t border-line ${i % 2 === 1 ? "bg-ivory-2" : "bg-ivory"}`}>
            <Reveal className="max-w-6xl mx-auto px-6 grid md:grid-cols-[auto_1fr_1fr] gap-8 md:gap-12 items-start">
              <div className="w-14 h-14 rounded-full border border-gold-soft flex items-center justify-center text-gold">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="eyebrow text-[10px] text-rose">{tag}</span>
                <h2 className="font-display text-3xl md:text-4xl text-espresso mt-2">{title}</h2>
                <p className="mt-4 text-espresso/65 leading-relaxed max-w-md">{desc}</p>
              </div>
              <ul className="space-y-3">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-espresso/70">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-gold shrink-0 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>
        ))}
      </div>

      <section className="py-20 border-t border-line text-center">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl text-espresso">
            Not sure what you need?
          </h2>
          <p className="mt-3 text-espresso/60">Tell us about the event — we'll recommend a package.</p>
          <Link to="/contact" className="inline-block mt-8 px-8 py-3 bg-espresso text-ivory hover:bg-rose transition-colors">
            Get a custom quote
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
