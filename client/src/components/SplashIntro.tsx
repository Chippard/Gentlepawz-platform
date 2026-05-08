import { useEffect, useState, useRef, useCallback } from "react";

interface SplashIntroProps {
  onComplete: () => void;
}

// Generate random particles for the field
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    depth: Math.random(), // 0 = far, 1 = close
    drift: (Math.random() - 0.5) * 60,
  }));
}

// Generate converging particles for logo assembly
function generateLogoParticles(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 150 + Math.random() * 200;
    return {
      id: i,
      startX: Math.cos(angle) * radius,
      startY: Math.sin(angle) * radius,
      size: 3 + Math.random() * 3,
      delay: Math.random() * 0.8,
      color: Math.random() > 0.5 ? "cyan" : "teal",
    };
  });
}

export default function SplashIntro({ onComplete }: SplashIntroProps) {
  const [phase, setPhase] = useState<"particles" | "logo" | "text" | "exit">("particles");
  const [isExiting, setIsExiting] = useState(false);
  const particlesRef = useRef(generateParticles(40));
  const logoParticlesRef = useRef(generateLogoParticles(24));
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onCompleteRef.current(), 800);
  }, []);

  useEffect(() => {
    // Phase timeline
    const t1 = setTimeout(() => setPhase("logo"), 800);
    const t2 = setTimeout(() => setPhase("text"), 1800);
    const t3 = setTimeout(() => setPhase("exit"), 3200);
    const t4 = setTimeout(handleExit, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [handleExit]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden ${
        isExiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ transition: "opacity 0.8s ease, transform 0.8s ease" }}
    >
      {/* Styles */}
      <style>{`
        @keyframes morphBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 0.8; }
          100% { transform: translateY(var(--float-y, -300px)) translateX(var(--drift, 0px)); opacity: 0; }
        }
        @keyframes converge {
          0% { transform: translate(var(--start-x), var(--start-y)) scale(1); opacity: 0.6; }
          70% { opacity: 1; }
          100% { transform: translate(0, 0) scale(0); opacity: 0; }
        }
        @keyframes logoReveal {
          0% { transform: scale(0.3); opacity: 0; filter: blur(20px); }
          60% { transform: scale(1.1); opacity: 1; filter: blur(0); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(0, 220, 220, 0.4)); }
          50% { filter: drop-shadow(0 0 60px rgba(0, 220, 220, 0.9)) drop-shadow(0 0 100px rgba(0, 180, 180, 0.4)); }
        }
        @keyframes letterReveal {
          0% { opacity: 0; transform: translateY(20px) rotateX(90deg); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) rotateX(0deg); filter: blur(0); }
        }
        @keyframes subtitleFade {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 0.7; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .splash-morph-bg {
          background: linear-gradient(
            -45deg,
            #041e1e, #0a3535, #0d4a4a, #083838, #051f1f, #0b4040
          );
          background-size: 400% 400%;
          animation: morphBg 4s ease infinite;
        }
        .splash-particle {
          animation: floatUp var(--duration, 3s) ease-in-out var(--delay, 0s) infinite;
          position: absolute;
          border-radius: 50%;
        }
        .splash-converge {
          animation: converge 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) var(--conv-delay, 0s) forwards;
          position: absolute;
          border-radius: 50%;
        }
        .splash-logo-container {
          animation: logoReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .splash-ring {
          animation: pulseRing 1.5s ease-out forwards;
          position: absolute;
          border: 2px solid rgba(0, 220, 220, 0.4);
          border-radius: 50%;
          width: 80px;
          height: 80px;
        }
        .splash-glow {
          animation: glowPulse 2s ease-in-out infinite;
        }
        .splash-letter {
          display: inline-block;
          animation: letterReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }
        .splash-subtitle {
          animation: subtitleFade 0.6s ease forwards;
          opacity: 0;
        }
        .splash-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0, 220, 220, 0.1) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .star-particle {
          animation: starTwinkle var(--twinkle-dur, 2s) ease-in-out var(--twinkle-delay, 0s) infinite;
          position: absolute;
          border-radius: 50%;
        }
      `}</style>

      {/* Morphing gradient background */}
      <div className="splash-morph-bg absolute inset-0" />

      {/* Shimmer overlay */}
      <div className="splash-shimmer absolute inset-0 pointer-events-none" />

      {/* Star field (static twinkling background) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={`star-${i}`}
            className="star-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              background: "rgba(255, 255, 255, 0.8)",
              "--twinkle-dur": `${1.5 + Math.random() * 2}s`,
              "--twinkle-delay": `${Math.random() * 3}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Floating particles (multi-layer parallax) */}
      <div className="absolute inset-0 pointer-events-none">
        {particlesRef.current.map((p) => (
          <div
            key={p.id}
            className="splash-particle"
            style={{
              left: `${p.x}%`,
              bottom: `${-10 + p.y * 0.2}%`,
              width: `${p.size * (0.5 + p.depth * 0.5)}px`,
              height: `${p.size * (0.5 + p.depth * 0.5)}px`,
              background: p.depth > 0.6
                ? `radial-gradient(circle, rgba(255, 215, 0, 0.9), rgba(255, 180, 0, 0.4))`
                : `radial-gradient(circle, rgba(0, 220, 220, 0.7), rgba(0, 180, 180, 0.2))`,
              boxShadow: p.depth > 0.6
                ? `0 0 ${6 + p.size}px rgba(255, 215, 0, 0.6)`
                : `0 0 ${4 + p.size}px rgba(0, 220, 220, 0.4)`,
              "--float-y": `${-200 - p.depth * 300}px`,
              "--drift": `${p.drift}px`,
              "--duration": `${p.duration}s`,
              "--delay": `${p.delay}s`,
              opacity: 0.3 + p.depth * 0.5,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Converging particles (logo assembly) */}
        {(phase === "logo" || phase === "text" || phase === "exit") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {logoParticlesRef.current.map((p) => (
              <div
                key={`conv-${p.id}`}
                className="splash-converge"
                style={{
                  "--start-x": `${p.startX}px`,
                  "--start-y": `${p.startY}px`,
                  "--conv-delay": `${p.delay}s`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.color === "cyan"
                    ? "rgba(0, 220, 220, 0.9)"
                    : "rgba(0, 180, 160, 0.9)",
                  boxShadow: `0 0 8px ${p.color === "cyan" ? "rgba(0, 220, 220, 0.8)" : "rgba(0, 180, 160, 0.8)"}`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* Logo */}
        {(phase === "logo" || phase === "text" || phase === "exit") && (
          <div className="relative flex items-center justify-center">
            {/* Pulse rings */}
            <div className="splash-ring" style={{ animationDelay: "0.2s" }} />
            <div className="splash-ring" style={{ animationDelay: "0.5s" }} />
            <div className="splash-ring" style={{ animationDelay: "0.8s" }} />

            {/* Logo SVG */}
            <div className="splash-logo-container splash-glow">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Heart shape */}
                <path
                  d="M50 85 C50 85 15 60 15 38 C15 25 25 15 37.5 15 C44 15 50 20 50 20 C50 20 56 15 62.5 15 C75 15 85 25 85 38 C85 60 50 85 50 85Z"
                  fill="url(#heartGrad)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
                {/* Paw print */}
                <ellipse cx="42" cy="48" rx="5" ry="6" fill="white" />
                <ellipse cx="58" cy="48" rx="5" ry="6" fill="white" />
                <ellipse cx="35" cy="38" rx="4" ry="5" fill="white" />
                <ellipse cx="65" cy="38" rx="4" ry="5" fill="white" />
                <ellipse cx="50" cy="60" rx="8" ry="9" fill="white" />
                <defs>
                  <linearGradient id="heartGrad" x1="15" y1="15" x2="85" y2="85">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        )}

        {/* Text reveal */}
        {(phase === "text" || phase === "exit") && (
          <div className="mt-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-serif font-bold text-white mb-3" style={{ perspective: "600px" }}>
              {"Gentle Pawz".split("").map((char, i) => (
                <span
                  key={i}
                  className="splash-letter"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
            <p
              className="splash-subtitle text-cyan-200/70 text-lg tracking-widest uppercase"
              style={{ animationDelay: "0.8s" }}
            >
              Boutique Dog Care Platform
            </p>
          </div>
        )}
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </div>
  );
}
