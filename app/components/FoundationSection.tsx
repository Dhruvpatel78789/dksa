"use client";

import { useState, useEffect, useRef } from "react";

const FRAME_COUNT = 63;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function useSectionProgress(sectionRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let rafId: number;
    function handleScroll() {
      rafId = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        setProgress(total > 0 ? scrolled / total : 0);
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [sectionRef]);
  
  return progress;
}

export default function FoundationSection() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const foundationRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  const foundationProgress = useSectionProgress(foundationRef);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const frameProgress = clamp((foundationProgress - 0.70) / 0.30);
  const currentFrame = Math.min(
    FRAME_COUNT,
    Math.max(0, Math.floor(frameProgress * FRAME_COUNT))
  );

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let nearestImg: HTMLImageElement | null = null;
    let minDiff = Infinity;

    for (let i = 0; i <= FRAME_COUNT; i++) {
      const img = imagesRef.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        const diff = Math.abs(i - frameIndex);
        if (diff < minDiff) {
          minDiff = diff;
          nearestImg = img;
        }
      }
    }

    if (nearestImg) {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = nearestImg.naturalWidth;
      const imgHeight = nearestImg.naturalHeight;

      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = canvasWidth / imgRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(nearestImg, offsetX, offsetY, drawWidth, drawHeight);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    const step = isMobile ? 2 : 1;
    imagesRef.current = [];

    for (let i = 0; i <= FRAME_COUNT; i += step) {
      const img = new Image();
      const paddedFrame = i.toString().padStart(3, "0");
      img.src = `/frames/frame_${paddedFrame}.webp`;
      img.onload = () => {
        if (Math.abs(i - currentFrame) <= step) {
          drawFrame(currentFrame);
        }
      };
      imagesRef.current[i] = img;
    }
  }, [mounted, isMobile]);

  useEffect(() => {
    if (!mounted) return;
    drawFrame(currentFrame);
  }, [currentFrame, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handleResizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawFrame(currentFrame);
      }
    };
    window.addEventListener("resize", handleResizeCanvas);
    handleResizeCanvas();
    return () => window.removeEventListener("resize", handleResizeCanvas);
  }, [mounted, currentFrame]);

  if (!mounted) return null;

  return (
    <section
      ref={foundationRef}
      style={{
        position: "relative",
        height: "400vh",
        backgroundColor: "#FFE5D4",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#FFE5D4",
          overflow: "hidden",
        }}
      >
        {(() => {
          const problems = [
            "hair fall",
            "weak roots",
            "dull hair",
            "dandruff",
            "dry scalp",
            "slow growth",
          ];

          const transitionProgress = clamp((foundationProgress - 0.35) / 0.18);
          const solutionMoveUpProgress = clamp((foundationProgress - 0.58) / 0.12);
          const videoSlideProgress = clamp((foundationProgress - 0.54) / 0.20);

          return (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 35,
                  pointerEvents: "none",
                  transform: `translate3d(0, -${transitionProgress * 100}vh, 0)`,
                  boxSizing: "border-box",
                  paddingInline: "clamp(24px, 8vw, 120px)",
                  width: "100%",
                }}
              >
                <div style={{ alignSelf: "center", textAlign: "center", marginBottom: "clamp(20px, 4vh, 40px)" }}>
                  <p
                    style={{
                      margin: 0,
                      color: "#6B705C",
                      fontSize: "clamp(20px, 3.5vw, 42px)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      fontWeight: 900,
                    }}
                  >
                    Struggling with
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px 18px",
                    maxWidth: "1100px",
                    width: "100%",
                    alignSelf: "center",
                    textAlign: "center",
                  }}
                >
                  {problems.map((problem, i) => {
                    const pairIndex = Math.floor(i / 2);
                    const start = 0.05 + pairIndex * 0.08;
                    const end = start + 0.08;
                    const itemProgress = clamp((foundationProgress - start) / (end - start));

                    return (
                      <h1
                        key={problem}
                        style={{
                          margin: 0,
                          fontSize: "clamp(30px, 5.5vw, 76px)",
                          lineHeight: 1.15,
                          letterSpacing: "-0.04em",
                          fontWeight: 900,
                          color: "#2F3E2F",
                          opacity: 0.25 + itemProgress * 0.75,
                          transition: "opacity 0.2s ease",
                          display: "inline",
                        }}
                      >
                        {problem}{i < problems.length - 1 ? "," : ""}
                      </h1>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const solutionOpacity =
                  clamp((foundationProgress - 0.38) / 0.08) *
                  (1 - clamp((foundationProgress - 0.60) / 0.08));

                return (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: `${50 - solutionMoveUpProgress * 90}%`,
                      transform: `translate(-50%, -50%) translate3d(0, ${100 * (1 - transitionProgress)}vh, 0)`,
                      width: "min(980px, 92vw)",
                      zIndex: 60,
                      opacity: solutionOpacity,
                      padding: "0 24px",
                      pointerEvents: "none",
                      textAlign: "center",
                      transition: "opacity 0.25s ease",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "clamp(56px, 9vw, 140px)",
                        lineHeight: 0.9,
                        letterSpacing: "-0.08em",
                        color: "#2F3E2F",
                      }}
                    >
                      We have the solution.
                    </h2>

                    <p
                      style={{
                        margin: "22px 0 0",
                        fontSize: "clamp(18px, 2vw, 30px)",
                        lineHeight: 1.35,
                        color: "#6B705C",
                      }}
                    >
                      Every concern deserves the right care.
                    </p>
                  </div>
                );
              })()}

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${100 - videoSlideProgress * 100}%`,
                  height: "100vh",
                  overflow: "hidden",
                  zIndex: 50,
                  backgroundColor: "#D8C8B6",
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            </>
          );
        })()}
      </div>
    </section>
  );
}
