"use client";

/** Vídeo hero dentro de un marco tipo navegador (escritorio). */
export default function HeroVideo() {
  return (
    <div className="hero-video-stage">
      <div className="hero-video-browser hero-video-browser-float">
        <div className="hero-video-browser-bar" aria-hidden>
          <div className="hero-video-browser-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-video-browser-url">www.diligenz.es</div>
        </div>
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
    </div>
  );
}
