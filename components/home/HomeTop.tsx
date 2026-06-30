"use client";

import { useEffect, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";

/** Barra «Valora» fija arriba; navbar sticky debajo durante todo el scroll. */
export default function HomeTop({ onHero = false }: { onHero?: boolean }) {
  const topbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const topbar = topbarRef.current;
    if (!topbar) return;

    const syncTopbarHeight = () => {
      document.documentElement.style.setProperty(
        "--site-topbar-height",
        `${topbar.offsetHeight}px`
      );
    };

    syncTopbarHeight();

    const observer = new ResizeObserver(syncTopbarHeight);
    observer.observe(topbar);
    window.addEventListener("resize", syncTopbarHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncTopbarHeight);
    };
  }, []);

  return (
    <>
      <div ref={topbarRef} className="site-topbar-fixed">
        <TopBar onHero={onHero} />
      </div>
      <div className="site-topbar-spacer" aria-hidden />
      <div className="site-navbar-sticky">
        <Navbar />
      </div>
    </>
  );
}
