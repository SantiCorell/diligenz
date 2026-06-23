import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";

/** TopBar desplazable + Navbar fija al hacer scroll. */
export default function HomeTop() {
  return (
    <>
      <TopBar />
      <div className="site-navbar-sticky">
        <Navbar />
      </div>
    </>
  );
}
