import React, { useEffect, useRef } from "react";

interface SplashIntroProps {
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Particle helpers
// ---------------------------------------------------------------------------
interface Particle {
  id: number;
  angle: number;   // degrees
  distance: number; // final travel distance in px
  size: number;    // px
  color: string;
  delay: number;   // ms
  duration: number; // ms
  shape: "circle" | "star" | "diamond";
}

function generateParticles(count: number): Particle[] {
  const colors = [
    "#22d3ee", // cyan-400
    "#06b6d4", // cyan-500
    "#67e8f9", // cyan-200
    "#fbbf24", // amber-400  (gold sparkle)
    "#fcd34d", // amber-300
    "#ffffff",
    "#a5f3fc", // cyan-100
    "#0e7490", // cyan-700
  ];
  const shapes: Particle["shape"][] = ["circle", "star", "diamond"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * (360 / count),
    distance: 120 + Math.random() * 220,
    size: 4 + Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 180,
    duration: 600 + Math.random() * 500,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  }));
}

const PARTICLES = generateParticles(48);

// ---------------------------------------------------------------------------
// Keyframe CSS injected once
// ---------------------------------------------------------------------------
const KEYFRAMES = `
  /* ── Logo burst ── */
  @keyframes gp-logo-burst {
    0%   { transform: scale(0) rotate(-15deg); opacity: 0; filter: brightness(4) blur(12px); }
    40%  { transform: scale(1.35) rotate(4deg);  opacity: 1; filter: brightness(2.5) blur(2px); }
    60%  { transform: scale(0.92) rotate(-2deg); opacity: 1; filter: brightness(1.4) blur(0); }
    75%  { transform: scale(1.08) rotate(1deg);  opacity: 1; filter: brightness(1.1); }
    88%  { transform: scale(0.97) rotate(0deg);  opacity: 1; filter: brightness(1); }
    100% { transform: scale(1)    rotate(0deg);  opacity: 1; filter: brightness(1); }
  }

  /* ── Shockwave ring ── */
  @keyframes gp-ring {
    0%   { transform: scale(0.1); opacity: 0.9; }
    100% { transform: scale(4.5); opacity: 0; }
  }

  /* ── White flash ── */
  @keyframes gp-flash {
    0%   { opacity: 0; }
    15%  { opacity: 0.85; }
    100% { opacity: 0; }
  }

  /* ── Glow pulse on logo ── */
  @keyframes gp-glow {
    0%   { box-shadow: 0 0 0px 0px rgba(34,211,238,0); }
    30%  { box-shadow: 0 0 80px 40px rgba(34,211,238,0.7), 0 0 140px 80px rgba(6,182,212,0.4); }
    70%  { box-shadow: 0 0 60px 30px rgba(34,211,238,0.4), 0 0 100px 60px rgba(6,182,212,0.2); }
    100% { box-shadow: 0 0 30px 15px rgba(34,211,238,0.25); }
  }

  /* ── Particle shoot ── */
  @keyframes gp-particle {
    0%   { transform: translate(0,0) scale(1);   opacity: 1; }
    80%  { opacity: 0.7; }
    100% { opacity: 0; }
  }

  /* ── Title slam ── */
  @keyframes gp-title {
    0%   { transform: scaleX(0.3) translateY(18px); opacity: 0; letter-spacing: -0.08em; }
    55%  { transform: scaleX(1.06) translateY(-4px); opacity: 1; letter-spacing: 0.06em; }
    75%  { transform: scaleX(0.97) translateY(2px);  opacity: 1; letter-spacing: 0.03em; }
    100% { transform: scaleX(1)    translateY(0);    opacity: 1; letter-spacing: 0.04em; }
  }

  /* ── Subtitle fade ── */
  @keyframes gp-subtitle {
    0%   { opacity: 0; transform: translateY(10px); letter-spacing: 0.35em; }
    100% { opacity: 1; transform: translateY(0);    letter-spacing: 0.45em; }
  }

  /* ── Whole splash fade out ── */
  @keyframes gp-fadeout {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ── Star shape ── */
  .gp-star {
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  }
  .gp-diamond {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const styleInjected = useRef(false);

  // Inject keyframes once into <head>
  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const tag = document.createElement("style");
    tag.textContent = KEYFRAMES;
    document.head.appendChild(tag);
    return () => {
      document.head.removeChild(tag);
    };
  }, []);

  // Fire onComplete after the full animation (3.8 s)
  useEffect(() => {
    const timer = setTimeout(onComplete, 3800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // ── Timing constants (ms) ──────────────────────────────────────────────
  const LOGO_DELAY      = 0;
  const RING1_DELAY     = 200;
  const RING2_DELAY     = 380;
  const RING3_DELAY     = 520;
  const FLASH_DELAY     = 150;
  const TITLE_DELAY     = 900;
  const SUBTITLE_DELAY  = 1550;
  const FADEOUT_START   = 2900;
  const FADEOUT_DUR     = 900;

  // ── Shared animation helpers ───────────────────────────────────────────
  const anim = (
    name: string,
    duration: number,
    delay = 0,
    easing = "cubic-bezier(0.22,1,0.36,1)",
    fill: "forwards" | "both" | "none" = "forwards"
  ): React.CSSProperties => ({
    animation: `${name} ${duration}ms ${easing} ${delay}ms ${fill}`,
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #042f2e 0%, #0f3d3d 40%, #083344 70%, #020d10 100%)",
        overflow: "hidden",
        ...anim("gp-fadeout", FADEOUT_DUR, FADEOUT_START, "ease-in"),
      }}
    >
      {/* ── Shockwave rings ──────────────────────────────────────────── */}
      {[
        { delay: RING1_DELAY, color: "rgba(34,211,238,0.55)", border: 3 },
        { delay: RING2_DELAY, color: "rgba(6,182,212,0.40)",  border: 2 },
        { delay: RING3_DELAY, color: "rgba(251,191,36,0.35)", border: 2 },
      ].map((ring, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: `${ring.border}px solid ${ring.color}`,
            opacity: 0,
            pointerEvents: "none",
            ...anim("gp-ring", 900, ring.delay, "ease-out"),
          }}
        />
      ))}

      {/* ── White flash overlay ──────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(34,211,238,0.4) 40%, transparent 70%)",
          opacity: 0,
          pointerEvents: "none",
          ...anim("gp-flash", 500, FLASH_DELAY, "ease-out"),
        }}
      />

      {/* ── Particles ────────────────────────────────────────────────── */}
      {PARTICLES.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        const shapeClass = p.shape === "star" ? "gp-star" : p.shape === "diamond" ? "gp-diamond" : "";
        return (
          <div
            key={p.id}
            className={shapeClass}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: p.shape === "circle" ? "50%" : undefined,
              background: p.color,
              opacity: 0,
              pointerEvents: "none",
              transform: "translate(0,0) scale(1)",
              // We drive the final position via a CSS custom-property trick
              // using a wrapper approach — inline keyframe via style tag per particle
              // would be too many tags; instead we use a single animation and
              // set the translate via a tiny inline <style> scoped to this id.
            }}
            ref={(el) => {
              if (!el) return;
              // Inject per-particle keyframe only once
              const kfId = `gp-p${p.id}`;
              if (document.getElementById(kfId)) return;
              const s = document.createElement("style");
              s.id = kfId;
              s.textContent = `
                @keyframes gp-p${p.id} {
                  0%   { transform: translate(0px,0px) scale(1); opacity:1; }
                  80%  { opacity:0.6; }
                  100% { transform: translate(${tx}px,${ty}px) scale(0.2); opacity:0; }
                }
              `;
              document.head.appendChild(s);
              el.style.animation = `gp-p${p.id} ${p.duration}ms ease-out ${RING1_DELAY + p.delay}ms forwards`;
            }}
          />
        );
      })}

      {/* ── Centre stage: logo + text ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "min(75vh, 75vw)",
            height: "min(75vh, 75vw)",
            borderRadius: "50%",
            overflow: "hidden",
            opacity: 0,
            transformOrigin: "center center",
            ...anim("gp-logo-burst", 800, LOGO_DELAY, "cubic-bezier(0.34,1.56,0.64,1)"),
          }}
          // Glow is a separate wrapper so it doesn't fight the scale transform
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              ...anim("gp-glow", 1200, LOGO_DELAY + 200, "ease-out", "forwards"),
            }}
          >
            <img
              src="/gentle_pawz_logo.png"
              alt="Gentle Pawz logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                borderRadius: "50%",
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Brand name */}
        <h1
          className="font-serif font-bold"
          style={{
            color: "#ffffff",
            fontSize: "clamp(2rem, 7vw, 3.5rem)",
            lineHeight: 1,
            margin: 0,
            textShadow:
              "0 0 30px rgba(34,211,238,0.8), 0 0 60px rgba(34,211,238,0.4), 0 2px 4px rgba(0,0,0,0.6)",
            opacity: 0,
            transformOrigin: "center",
            ...anim("gp-title", 650, TITLE_DELAY, "cubic-bezier(0.22,1,0.36,1)"),
          }}
        >
          Gentle Pawz
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "#67e8f9",
            fontSize: "clamp(0.65rem, 2.2vw, 0.9rem)",
            fontWeight: 500,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            margin: 0,
            opacity: 0,
            ...anim("gp-subtitle", 700, SUBTITLE_DELAY, "ease-out"),
          }}
        >
          Boutique Dog Care
        </p>
      </div>
    </div>
  );
};

export default SplashIntro;
