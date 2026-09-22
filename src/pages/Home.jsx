import Hero from "../components/Hero";
import Services from "../components/Services";
import ProcessSteps from "../components/ProcessSteps";
import Testimonials from "../components/Testimonials";
import PublicWork from "../components/PublicWork";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <ProcessSteps />
      <Testimonials />
      <section className="max-w-6xl mx-auto px-6 py-20"><h2 className="font-display text-4xl mb-8">Selected work</h2><PublicWork limit={6}/></section>
    </>
  );
}
