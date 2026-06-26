import HomeTop from "@/components/home/HomeTop";
import Footer from "@/components/layout/Footer";
import PageAmbient from "@/components/layout/PageAmbient";

export default function ShellLayout({
  children,
  homeHero,
}: {
  children: React.ReactNode;
  /** En inicio: morado desde arriba con TopBar + Navbar encima */
  homeHero?: React.ReactNode;
}) {
  return (
    <>
      <main className="relative min-h-screen bg-white">
        <PageAmbient />
        <div className="relative z-10">
          {homeHero && <div className="home-purple-backdrop hero-panel" aria-hidden />}
          <HomeTop onHero={Boolean(homeHero)} />
          {homeHero ? (
            <>
              <div className="relative z-[1] overflow-x-clip">{homeHero}</div>
              <div className="overflow-x-clip">{children}</div>
            </>
          ) : (
            <div className="overflow-x-clip">{children}</div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
