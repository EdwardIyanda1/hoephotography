import { Link } from "react-router-dom";
import { CameraIcon, VideoIcon, LiveIcon, DroneIcon, ArrowIcon } from "./Icons";
import Reveal from "./Reveal";

const SERVICES = [
  { title: "Portraits", desc: "Timeless images that capture your true essence.", Icon: CameraIcon, link: "/services" },
  { title: "Documentary", desc: "Feel every moment of your wedding or event through honest storytelling.", Icon: VideoIcon, link: "/services" },
  { title: "Livestream", desc: "Multi-camera streaming so nobody misses the moment.", Icon: LiveIcon, link: "/services" },
  { title: "Drone Coverage", desc: "Aerial photography and video for events, real estate and landscapes.", Icon: DroneIcon, link: "/services" },
];

// Teaser used on the homepage — mirrors Gazmadu's "Signature Services" cards.
export default function Services() {
  return (
    <section className="bg-ivory py-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center max-w-xl mx-auto">
          <p className="eyebrow text-xs text-rose mb-3">Ways we can work together</p>
          <h2 className="font-display text-4xl md:text-5xl text-espresso">
            Signature services
          </h2>
        </Reveal>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map(({ title, desc, Icon, link }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <Link to={link} className="group block text-center">
                <div className="w-14 h-14 mx-auto rounded-full border border-gold-soft flex items-center justify-center text-gold group-hover:bg-espresso group-hover:text-ivory group-hover:border-espresso transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl mt-5 text-espresso">{title}</h3>
                <p className="mt-2 text-sm text-espresso/60 leading-relaxed">{desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 eyebrow text-[11px] text-rose">
                  Learn more <ArrowIcon className="w-3 h-3" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
