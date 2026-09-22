import PublicWork from "../components/PublicWork";
import Packages from "../components/Packages";
import { Link } from "react-router-dom";
export default function Wedding() {
  return (
    <main className="portal">
      <p className="eyebrow">Wedding photography & film</p>
      <h1>Your day, told in full.</h1>
      <p className="portal-intro">
        Photography, film and coverage shaped around your wedding.
      </p>
      <h2 className="portal-section-title">Wedding packages</h2>
      <Packages category="Wedding" />
      <h2 className="portal-section-title">Wedding stories</h2>
      <PublicWork category="Wedding" />
      <div className="portal-actions">
        <Link to="/contact">Discuss your date with the studio →</Link>
      </div>
    </main>
  );
}
