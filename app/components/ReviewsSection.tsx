"use client";

import { useState, useEffect, useRef } from "react";
import { getOptimizedMediaUrl } from "@/lib/media";

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

export default function ReviewsSection({ reviews }: { reviews: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [isReviewSectionActive, setIsReviewSectionActive] = useState(false);
  
  const reviewRef = useRef<HTMLElement | null>(null);
  const reviewProgress = useSectionProgress(reviewRef);

  const activeIndex = reviews && reviews.length > 0 
    ? Math.min(reviews.length - 1, Math.max(0, Math.floor(reviewProgress * reviews.length))) 
    : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const reviewRect = reviewRef.current?.getBoundingClientRect();
        setIsReviewSectionActive(
          !!reviewRect &&
          reviewRect.top <= window.innerHeight &&
          reviewRect.bottom >= 0
        );
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <section
      ref={reviewRef}
      style={{
        position: "relative",
        minHeight: `${Math.max(reviews?.length || 1, 1) * 100}vh`,
        backgroundColor: "#FFE5D4",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <h2
          style={{
            position: "absolute",
            top: "32px",
            left: "40px",
            margin: 0,
            color: "#2F3E2F",
            fontSize: "clamp(44px, 8vw, 110px)",
            lineHeight: 0.9,
            letterSpacing: "-0.08em",
            zIndex: 220,
          }}
        >
          Reviews
        </h2>

        {!reviews || reviews.length === 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3A5A40",
              fontSize: "22px",
              fontWeight: 700,
              zIndex: 300,
            }}
          >
            No reviews selected.
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "visible",
              userSelect: "none",
            }}
          >
            {reviews.map((r, i) => {
              let offset = i - activeIndex;

              if (offset > reviews.length / 2) offset -= reviews.length;
              if (offset < -reviews.length / 2) offset += reviews.length;

              const colors = [
                "#3A5A40",
                "#FFFFFF",
                "#8B6F47",
                "#A68A64",
                "#6B705C",
              ];

              const cardColor = colors[i % colors.length];
              const textColor = cardColor === "#FFFFFF" ? "#2F3E2F" : "white";

              const mediaUrl =
                (r.type === "image" || r.type === "video") && r.mediaUrl
                  ? getOptimizedMediaUrl(r.mediaUrl, r.type)
                  : "";

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "54%",
                    width: "min(340px, 72vw)",
                    height: "min(560px, 72vh)",
                    padding: r.type === "text" ? "24px" : "14px",
                    borderRadius: "32px",
                    backgroundColor: cardColor,
                    color: textColor,
                    boxShadow: "0 24px 55px rgba(0,0,0,0.28)",
                    transform: `
                      translate(-50%, -50%)
                      translateX(${offset * 105}px)
                      translateY(${Math.abs(offset) * 38}px)
                      rotate(${offset * 7}deg)
                      scale(${offset === 0 ? 1.07 : 0.94})
                    `,
                    zIndex: offset === 0 ? 100 : 100 - Math.abs(offset),
                    opacity: Math.abs(offset) > 4 ? 0 : 1,
                    transition: "all 0.35s ease",
                    overflow: "hidden",
                  }}
                >
                  {r.type === "text" && (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                      }}
                    >
                      <h3 style={{ marginBottom: "18px", fontSize: "28px" }}>
                        {r.name}
                      </h3>

                      <p
                        style={{
                          fontSize: "22px",
                          lineHeight: "1.5",
                          margin: 0,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 9,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {r.review}
                      </p>
                    </div>
                  )}

                  {r.type === "image" && mediaUrl && (
                    <img
                      src={mediaUrl}
                      alt="Review"
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "24px",
                      }}
                    />
                  )}

                  {r.type === "video" && mediaUrl && (
                    <video
                      src={mediaUrl}
                      muted={!isReviewSectionActive || offset !== 0}
                      autoPlay={Math.abs(offset) <= 1}
                      loop
                      playsInline
                      preload={Math.abs(offset) <= 1 ? "auto" : "metadata"}
                      controls={offset === 0}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "22px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
