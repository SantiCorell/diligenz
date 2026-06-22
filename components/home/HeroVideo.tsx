"use client";

/**
 * Animación hero estilo Deale: vídeo centrado bajo el CTA, con sombra suave.
 */
export default function HeroVideo() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 pb-4 sm:pb-8">
      <div className="hero-video-glow relative overflow-hidden rounded-3xl bg-white/40 shadow-[0_24px_80px_rgba(123,97,255,0.18)] ring-1 ring-[var(--brand-primary)]/10">
        <video
          className="block w-full h-auto"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="Demostración de la plataforma Diligenz"
        >
          <source src="/videos/hero-platform.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
