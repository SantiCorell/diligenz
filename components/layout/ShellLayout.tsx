import HomeTop from "@/components/home/HomeTop";
import Footer from "@/components/layout/Footer";
import PageAmbient from "@/components/layout/PageAmbient";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="relative min-h-screen bg-white">
        <PageAmbient />
        <div className="relative z-10">
          <HomeTop />
          <div className="overflow-x-clip">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
