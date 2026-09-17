"use client";

import { useState, useEffect, useRef } from "react";
import { slugify } from "@/lib/normalize";

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

export default function HeroSection({ promotions }: { promotions: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const promotionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % promotions.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [promotions.length]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!promotions || promotions.length === 0) return null;

  return (
    <section
      ref={promotionRef}
      style={{
        position: "relative",
        height: "100vh",
        backgroundColor: "#FFE5D4",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          transform: `translateX(-${activeSlide * 100}%)`,
          transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {promotions.map((item, index) => (
          <div
            key={item._id || index}
            onClick={() => {
              const targetSlug = item.slug || slugify(item.name || "");
              window.location.href = `/product/${targetSlug}`;
            }}
            style={{
              flex: "0 0 100%",
              width: "100vw",
              height: "100vh",
              position: "relative",
              cursor: "pointer",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "70%",
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                WebkitMaskImage: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
                maskImage: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: isMobile ? "140px" : "150px",
                left: isMobile ? "24px" : "64px",
                right: isMobile ? "24px" : "64px",
                textAlign: "left",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "999px",
                  padding: "4px 16px 4px 4px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#81B29A",
                    color: "#FFFFFF",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <span>{Number(item.promoRating || 5).toFixed(1)}</span>
                  <span style={{ fontSize: "10px" }}>★</span>
                </div>
                <span
                  style={{
                    marginLeft: "10px",
                    color: "#2F3E2F",
                    fontSize: "10px",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  AVG. RATING
                </span>
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#FFE5D4",
                  fontSize: isMobile ? "32px" : "56px",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {item.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {promotions.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "8px",
            zIndex: 100,
          }}
        >
          {promotions.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(i);
              }}
              style={{
                width: i === activeSlide ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: i === activeSlide ? "#2F3E2F" : "rgba(47, 62, 47, 0.3)",
                border: "none",
                cursor: "pointer",
                transition: "width 0.4s ease, background-color 0.4s ease",
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: `translateX(-50%) translateY(${hasScrolled ? "20px" : "0px"})`,
          opacity: hasScrolled ? 0 : 1,
          transition: "opacity 0.4s ease, transform 0.4s ease",
          zIndex: 999,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            animation: "bounce 2.2s infinite ease-in-out",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(47, 62, 47, 0.95)",
              color: "#FFE5D4",
              padding: "10px 18px",
              borderRadius: "22px",
              fontSize: "13px",
              fontWeight: 900,
              boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
              border: "1px solid rgba(255,255,255,0.08)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Scroll down to explore
          </div>
          <div
            style={{
              width: "24px",
              height: "40px",
              borderRadius: "12px",
              border: "2px solid #2F3E2F",
              position: "relative",
              backgroundColor: "rgba(255, 229, 212, 0.8)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "8px",
                backgroundColor: "#2F3E2F",
                borderRadius: "2px",
                position: "absolute",
                top: "6px",
                left: "50%",
                transform: "translateX(-50%)",
                animation: "scrollWheel 1.6s infinite",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes scrollWheel {
          0% { opacity: 0; top: 6px; }
          30% { opacity: 1; }
          90% { opacity: 0; top: 20px; }
          100% { opacity: 0; top: 6px; }
        }
      `}</style>
    </section>
  );
}
