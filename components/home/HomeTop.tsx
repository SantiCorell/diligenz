import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";

/** TopBar + Navbar fijos al scroll (sticky en toda la página). */
export default function HomeTop({ onHero = false }: { onHero?: boolean }) {
  return (
    <div className="site-header-sticky">
      <TopBar onHero={onHero} />
      <div className="site-navbar-sticky">
        <Navbar />
      </div>
    </div>
  );
}
