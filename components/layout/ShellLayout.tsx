import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <Navbar />
      <main className="min-h-screen bg-[var(--brand-bg)]">{children}</main>
      <Footer />
    </>
  );
}
