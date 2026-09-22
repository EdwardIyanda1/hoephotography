import CreateProject from "./pages/CreateProject";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import StudioSettings from "./pages/StudioSettings";
import Legal from "./pages/Legal";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Wedding from "./pages/Wedding";
import OtherBusiness from "./pages/OtherBusiness";

export default function App() {
  return (
    <Routes>
      <Route path="/projects/:id" element={<Project />} />
      {/* Hoe Multimedia Concept — shares the branded nav/footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/studio" element={<Dashboard studio />} />
        <Route path="/studio/projects/new" element={<CreateProject />} />
        <Route path="/studio/settings" element={<StudioSettings />} />
        <Route path="/privacy" element={<Legal privacy />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/Documentry" element={<Home />} />
        <Route path="/Livestream" element={<Home />} />
        <Route path="/Portriats" element={<Home />} />
        <Route path="/Drone" element={<Home />} />
        <Route path="/wedding" element={<Wedding />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* A different business entirely — self-contained page, its own
          nav/footer, no Hoe Multimedia branding. */}
      <Route path="/other-business" element={<OtherBusiness />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
