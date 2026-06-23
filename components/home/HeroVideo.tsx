"use client";

/** Vídeo hero dentro del panel morado — fondo blanco del propio MP4. */
export default function HeroVideo() {
  return (
    <div className="hero-video-stage">
      <div className="hero-video-clip">
        <video
          className="hero-video-element"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="Demostración de la plataforma Diligenz"
        >
          <source src="/videos/hero-platform.mp4?v=4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
