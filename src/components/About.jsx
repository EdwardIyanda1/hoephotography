export default function About() {
  return (
    <section id="about" className="bg-paper text-text-dark py-24 border-t border-text-dark/10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[1fr_1.2fr] gap-12 items-start">
        <div>
          <p className="hud-label text-xs text-teal mb-3">Who's behind the lens</p>
          <h2 className="font-display text-4xl md:text-5xl">About Hoe Multimedia Concept</h2>
        </div>
        <div className="space-y-5 text-text-dark/75 leading-relaxed font-body">
          <p>
            Hoe Multimedia Concept is a media production outfit based in Ibadan,
            covering photography, videography, livestream and drone services for
            weddings, corporate events, real estate and personal brands.
          </p>
          <p>
            We handle everything from planning the shoot to the final edit, so
            every client gets one point of contact from first call to delivered
            files.
          </p>
          <p className="text-sm text-text-dark/50 hud-label">
            [ TODO: replace with real founder bio / years of experience / equipment list ]
          </p>
        </div>
      </div>
    </section>
  );
}
