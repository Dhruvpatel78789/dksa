"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const products = [
  {
    slug: "root-revival-oil",
    name: "Root Revival Oil",
    image: "/products/product-1.webp",
    description:
      "A lightweight daily oil designed to support healthier-looking roots and reduce visible hair stress.",
    benefits: [
      "Supports stronger-looking roots",
      "Helps reduce visible hair fall",
      "Non-sticky daily formula",
    ],
    cta: "Explore Oil",
    callouts: ["root support", "hair fall care"],
  },
  {
    slug: "scalp-balance-cleanser",
    name: "Anti Aging & Rejuvenating (21 bhavna yukta) Scalp Balance Cleanser",
    image: "/products/product-2.webp",
    description:
      "A gentle scalp-first cleanser crafted to refresh buildup, calm dryness, and support a cleaner scalp environment.",
    benefits: [
      "Relieves pitta roga",
      "Best to stop hair fall",
      "Refreshes oil and buildup",
      "Gentle enough for routine use",
    ],
    cta: "Explore Cleanser",
    callouts: ["scalp balance", "flake control"],
  },
  {
    slug: "strength-repair-mask",
    name: "Strength Repair Mask",
    image: "/products/product-3.webp",
    description:
      "A rich conditioning mask made for dull, weak, and tired-looking hair that needs softness and visible shine.",
    benefits: [
      "Adds smoothness and shine",
      "Helps improve hair texture",
      "Deep conditioning support",
    ],
    cta: "Explore Mask",
    callouts: ["deep repair", "visible shine"],
  },
];

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

export default function ProductStorySection() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const productRef = useRef<HTMLElement | null>(null);
  const productProgress = useSectionProgress(productRef);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) return null;

  return (
    <section
      ref={productRef}
      style={{
        position: "relative",
        height: "760vh",
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
        {(() => {
          const backgrounds = ["#FFFFFF", "#3A5A40", "#FFE5D4"];

          const productCount = products.length;
          const raw = productProgress * productCount;

          const productIndex = Math.min(productCount - 1, Math.floor(raw));
          const local = raw - productIndex;
          const product = products[productIndex];

          const bgColor = backgrounds[productIndex % backgrounds.length];
          const isDark = bgColor === "#3A5A40";

          const textColor = isDark ? "#FFFFFF" : "#2F3E2F";
          const mutedText = isDark ? "rgba(255,255,255,0.78)" : "#6B705C";

          const enterProgress = clamp(local / 0.25);
          const holdProgress = clamp((local - 0.25) / 0.45);
          const exitProgress = clamp((local - 0.78) / 0.22);

          const productScale = 0.86 + enterProgress * 0.12 + holdProgress * 0.08;

          const productY =
            (1 - enterProgress) * 120 - holdProgress * 40 - exitProgress * 80;

          const textY = (1 - enterProgress) * 80 - exitProgress * 80;

          const productOpacity = 1 - exitProgress;
          const textOpacity = clamp(enterProgress * 1.4) * (1 - exitProgress);

          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: bgColor,
                transition: "background-color 0.35s ease",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? "0px" : "32px",
                padding: isMobile ? "18px 22px 24px" : "54px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: isMobile ? "none" : "1 1 64%",
                  width: isMobile ? "100%" : "64%",
                  height: isMobile ? "42vh" : "88vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "visible",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: isMobile ? "220px" : "560px",
                    height: isMobile ? "220px" : "560px",
                    borderRadius: "999px",
                    background: isDark
                      ? "radial-gradient(rgba(255,255,255,0.18), transparent 70%)"
                      : "radial-gradient(rgba(58,90,64,0.16), transparent 70%)",
                    transform: `scale(${0.9 + holdProgress * 0.35})`,
                    zIndex: 0,
                  }}
                />

                {!isMobile && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        left: "1%",
                        top: "30%",
                        color: textColor,
                        fontSize: "24px",
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        opacity: textOpacity,
                        transform: `translateX(${(1 - enterProgress) * -40}px)`,
                      }}
                    >
                      {product.callouts[0]}
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        left: "15%",
                        top: "35%",
                        width: "340px",
                        borderTop: `2px solid ${
                          isDark
                            ? "rgba(255,255,255,0.55)"
                            : "rgba(47,62,47,0.5)"
                        }`,
                        opacity: textOpacity,
                        transform: `scaleX(${enterProgress})`,
                        transformOrigin: "left center",
                      }}
                    />
                  </>
                )}

                {!isMobile && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        right: "1%",
                        bottom: "30%",
                        color: textColor,
                        fontSize: "24px",
                        fontWeight: 900,
                        textAlign: "right",
                        letterSpacing: "-0.04em",
                        opacity: textOpacity,
                        transform: `translateX(${(1 - enterProgress) * 40}px)`,
                      }}
                    >
                      {product.callouts[1]}
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        right: "15%",
                        bottom: "35%",
                        width: "340px",
                        borderTop: `2px solid ${
                          isDark
                            ? "rgba(255,255,255,0.55)"
                            : "rgba(47,62,47,0.5)"
                        }`,
                        opacity: textOpacity,
                        transform: `scaleX(${enterProgress})`,
                        transformOrigin: "right center",
                      }}
                    />
                  </>
                )}

                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    position: "relative",
                    zIndex: 3,
                    width: isMobile ? "72vw" : "min(560px, 44vw)",
                    height: isMobile ? "38vh" : "82vh",
                    objectFit: "contain",
                    opacity: productOpacity,
                    transform: `
                      translateY(${productY}px)
                      scale(${productScale})
                    `,
                    transition: "none",
                    filter: isDark
                      ? "drop-shadow(0 54px 84px rgba(0,0,0,0.42))"
                      : "drop-shadow(0 54px 84px rgba(0,0,0,0.24))",
                  }}
                />
              </div>

              <div
                style={{
                  width: isMobile ? "100%" : "34%",
                  maxWidth: isMobile ? "520px" : "560px",
                  textAlign: isMobile ? "center" : "left",
                  opacity: textOpacity,
                  transform: `translateY(${isMobile ? textY * 0.35 : textY}px)`,
                  margin: isMobile ? "0 auto" : undefined,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMobile ? "center" : "flex-start",
                }}
              >
                <p
                  style={{
                    margin: isMobile ? "0 0 8px" : "0 0 14px",
                    color: mutedText,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  Foundation Care
                </p>

                <h2
                  style={{
                    margin: isMobile ? "0 0 12px" : "0 0 20px",
                    fontSize: isMobile
                      ? "clamp(34px, 9vw, 52px)"
                      : "clamp(52px, 6vw, 92px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.07em",
                    color: textColor,
                  }}
                >
                  {product.name}
                </h2>

                <p
                  style={{
                    margin: isMobile ? "0 0 16px" : "0 0 26px",
                    color: mutedText,
                    fontSize: isMobile ? "15px" : "21px",
                    lineHeight: isMobile ? 1.45 : 1.58,
                    maxWidth: isMobile ? "420px" : undefined,
                  }}
                >
                  {product.description}
                </p>

                <ul
                  style={{
                    margin: isMobile ? "0 0 18px" : "0 0 32px",
                    padding: 0,
                    listStyle: "none",
                    display: "grid",
                    gap: isMobile ? "8px" : "12px",
                  }}
                >
                  {product.benefits.map((benefit, index) => (
                    <li
                      key={benefit}
                      style={{
                        color: textColor,
                        fontSize: isMobile ? "14px" : "19px",
                        fontWeight: 800,
                        opacity: clamp(textOpacity - index * 0.12),
                        transform: `translateY(${
                          (1 - clamp(textOpacity - index * 0.12)) * 12
                        }px)`,
                      }}
                    >
                      ✓ {benefit}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/collections"
                  style={{ textDecoration: "none" }}
                >
                  <button
                    style={{
                      border: "none",
                      borderRadius: "999px",
                      padding: isMobile ? "12px 24px" : "16px 30px",
                      minWidth: isMobile ? "220px" : undefined,
                      backgroundColor: isDark ? "#FFE5D4" : "#3A5A40",
                      color: isDark ? "#2F3E2F" : "white",
                      fontWeight: 900,
                      fontSize: isMobile ? "14px" : "17px",
                      cursor: "pointer",
                      boxShadow: isDark
                        ? "0 18px 34px rgba(0,0,0,0.22)"
                        : "0 18px 34px rgba(58,90,64,0.24)",
                      transform: `scale(${1 + holdProgress * 0.04})`,
                    }}
                  >
                    {product.cta}
                  </button>
                </Link>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
