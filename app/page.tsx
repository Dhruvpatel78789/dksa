"use client";

import { useEffect, useRef, useState } from "react";
import { getOptimizedMediaUrl } from "@/lib/media";
import Link from "next/link";
import FloatingActions from "./components/FloatingActions";

const FRAME_COUNT = 239;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

const products = [
  {
    slug: "root-revival-oil",
    name: "Root Revival Oil",
    image: "/products/product-1.png",
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
    image: "/products/product-2.png",
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
    image: "/products/product-3.png",
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

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const [hoveredPromotionIndex, setHoveredPromotionIndex] = useState<number | null>(
    null
  );

  const [isMobileRaw, setIsMobileRaw] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = mounted ? isMobileRaw : false;

  const [foundationProgress, setFoundationProgress] = useState<number>(0);
  const [promoScrollProgress, setPromoScrollProgress] = useState<number>(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [productProgress, setProductProgress] = useState<number>(0);
  const [reviewProgress, setReviewProgress] = useState<number>(0);
  const [isReviewSectionActive, setIsReviewSectionActive] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const foundationRef = useRef<HTMLElement | null>(null);
  const productRef = useRef<HTMLElement | null>(null);
  const reviewRef = useRef<HTMLElement | null>(null);
  const promotionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  async function loadReviews() {
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/reviews");

      if (!res.ok) {
        setReviews([]);
        return;
      }

      const data = await res.json();
      setReviews(data.reviews || []);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPromotions() {
  try {
    const res = await fetch("/api/user/promotions");

    if (!res.ok) {
      setPromotions([]);
      return;
    }

    const data = await res.json();
    setPromotions(data.promotions || []);
  } catch {
    setPromotions([]);
  }
}

  useEffect(() => {
    loadReviews();
    loadPromotions();
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % promotions.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [promotions.length]);

  useEffect(() => {
    function getSectionProgress(section: HTMLElement | null) {
      if (!section) return 0;

      const rect = section.getBoundingClientRect();
      const totalScrollableHeight = section.offsetHeight - window.innerHeight;

      const scrolledInsideSection = Math.min(
        Math.max(-rect.top, 0),
        totalScrollableHeight
      );

      return totalScrollableHeight > 0
        ? scrolledInsideSection / totalScrollableHeight
        : 0;
    }

    function handleScroll() {
      const foundation = getSectionProgress(foundationRef.current);
      const product = getSectionProgress(productRef.current);
      const review = getSectionProgress(reviewRef.current);
      const reviewRect = reviewRef.current?.getBoundingClientRect();

      const reviewSectionActive =
        !!reviewRect &&
        reviewRect.top <= window.innerHeight &&
        reviewRect.bottom >= 0;

      setIsReviewSectionActive(reviewSectionActive);
     

      const promo = getSectionProgress(promotionRef.current);
      setPromoScrollProgress(promo);
      setFoundationProgress(foundation);
      setProductProgress(product);
      setReviewProgress(review);
      setHasScrolled(window.scrollY > 30);
      

      if (reviews.length > 0) {
        const nextIndex = Math.min(
          reviews.length - 1,
          Math.floor(review * reviews.length)
        );

        setActiveIndex(nextIndex);
      }
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [reviews.length]);
  useEffect(() => {
  if (window.location.pathname === "/") {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }
}, []);

  const frameProgress = clamp((foundationProgress - 0.82) / 0.18);
  const currentFrame = Math.min(
    FRAME_COUNT,
    Math.max(0, Math.floor(frameProgress * FRAME_COUNT))
  );
  const paddedFrame = currentFrame.toString().padStart(3, "0");
  const frameSrc = `/frames/frame_${paddedFrame}.png`;

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
    const step = isMobile ? 6 : 1;
    imagesRef.current = [];

    for (let i = 0; i <= FRAME_COUNT; i += step) {
      const img = new Image();
      const paddedFrame = i.toString().padStart(3, "0");
      img.src = `/frames/frame_${paddedFrame}.png`;
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

useEffect(() => {
  setMounted(true);
  function handleResize() {
    setIsMobileRaw(window.innerWidth < 768);
  }

  handleResize();
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
const footerHeadingStyle: React.CSSProperties = {
  margin: "0 0 28px",
  color: "#333333",
  fontSize: "20px",
  fontWeight: 900,
  letterSpacing: "0.02em",
};

function FooterLink({ text }: { text: string }) {
  return (
    <p
      style={{
        margin: "0 0 20px",
        color: "#7A7A7A",
        fontSize: "18px",
        lineHeight: 1.4,
        cursor: "pointer",
      }}
    >
      {text}
    </p>
  );
}

  if (!mounted) {
    return (
      <main
        style={{
          margin: 0,
          padding: 0,
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#FFE5D4",
        }}
      />
    );
  }

  return (
    <main
    
      style={{
        margin: 0,
        padding: 0,
        width: "100%",
        fontFamily: "Arial",
        overflowX: "visible",
        backgroundColor: "#FFE5D4",
      }}
    >
      <FloatingActions />
      <div
  style={{
    position: "fixed",
    top: "22px",
    right: "22px",
    zIndex: 9999,
    display: "flex",
    gap: "12px",
  }}
>
</div>
      {/* SECTION 5: PROMOTED PRODUCTS (Moved to top) */}
      {promotions && promotions.length > 0 && (
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
                  window.location.href = `/products/${item._id}`;
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

                {/* Blurred glassmorphism overlay in the bottom portion */}
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

                {/* Name & Rating display */}
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
                  {/* Rating Capsule */}
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

          {/* Premium Auto Scroll Dots */}
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

          {/* Animated Scroll Prompt */}
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
      )}

      {/* SECTION 1: PROBLEMS + SOLUTION + FRAME SEQUENCE */}
<section
  ref={foundationRef}
  style={{
    position: "relative",
    height: "1200vh",
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

      /*
        Timeline:
        0.00 - 0.30  typewriter ends on slow growth
        0.30 - 0.44  chips appear close/random around slow growth
        0.44 - 0.66  chips expand outward
        0.55          problem statement disappears completely
        0.56 - 0.66  solution statement appears at exact same center point
        0.68 - 0.80  solution statement moves up and exits
        0.76 - 0.88  video slides up from bottom
        0.88 - 1.00  video is fully visible; frame sequence plays
      */

      const typeProgress = clamp(foundationProgress / 0.3);

      const rawIndex = typeProgress * problems.length;
      const currentIndex = Math.min(
        problems.length - 1,
        Math.floor(rawIndex)
      );

      const currentWord = problems[currentIndex];
      const localProgress = rawIndex - currentIndex;

      const typingProgress =
        localProgress < 0.72 ? localProgress / 0.72 : 1;

      const visibleLetters = Math.floor(
        currentWord.length * typingProgress
      );

      const typedText = currentWord.slice(0, visibleLetters);


      const chipAppearProgress = clamp((foundationProgress - 0.34) / 0.12);

      // chips expansion synced with solution appearance
      const chipExitProgress = clamp((foundationProgress - 0.46) / 0.26);

      // smooth fade out for slow growth
      const problemFadeOut = 1 - clamp((foundationProgress - 0.29) / 0.18);

      // solution fades in while chips expand
      const solutionReveal = clamp((foundationProgress - 0.45) / 0.2);

      // move solution upward later
      const solutionMoveUpProgress = clamp((foundationProgress - 0.67) / 0.12);

      // video slides in only after text moves
      const videoSlideProgress = clamp((foundationProgress - 0.65) / 0.18);

      const chipPositions = [
        {
          label: "hair fall",
          startX: -18,
          startY: -10,
          exitX: -120,
          exitY: -82,
          rotate: -13,
        },
        {
          label: "weak roots",
          startX: 6,
          startY: -16,
          exitX: 42,
          exitY: -122,
          rotate: 11,
        },
        {
          label: "dull hair",
          startX: 20,
          startY: -5,
          exitX: 118,
          exitY: -38,
          rotate: -9,
        },
        {
          label: "dandruff",
          startX: 17,
          startY: 13,
          exitX: 114,
          exitY: 72,
          rotate: 12,
        },
        {
          label: "dry scalp",
          startX: -8,
          startY: 17,
          exitX: -36,
          exitY: 112,
          rotate: -11,
        },
        {
          label: "slow growth",
          startX: -21,
          startY: 5,
          exitX: -118,
          exitY: 50,
          rotate: 9,
        },
      ];

      return (
        <>
          {/* Problem typewriter / slow growth statement */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 35,
                pointerEvents: "none",
                opacity: problemFadeOut,
                transition: "opacity 0.1s linear",
              }}
            >
              <div style={{ textAlign: "center", padding: "0 24px" }}>
                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#6B705C",
                    fontSize: "clamp(18px, 2vw, 28px)",
                    letterSpacing: "0.04em",
                  }}
                >
                  Struggling with
                </p>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(52px, 11vw, 150px)",
                    lineHeight: 1,
                    letterSpacing: "-0.07em",
                    color: "#2F3E2F",
                  }}
                >
                  {foundationProgress < 0.3 ? typedText : "slow growth"}

                  {foundationProgress < 0.3 && (
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "8px",
                        width: "4px",
                        height: "0.8em",
                        backgroundColor: "#3A5A40",
                        transform: "translateY(8px)",
                        opacity:
                          Math.floor(foundationProgress * 80) % 2 === 0
                            ? 1
                            : 0.25,
                      }}
                    />
                  )}
                </h1>
              </div>
            </div>
          
          

          {/* Chips: close/random first, then expand outward */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 45,
              pointerEvents: "none",
            }}
          >
            {chipPositions.map((chip) => {
              const x =
                chip.startX +
                (chip.exitX - chip.startX) * chipExitProgress;

              const y =
                chip.startY +
                (chip.exitY - chip.startY) * chipExitProgress;

              return (
                <div
                  key={chip.label}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    padding: "14px 22px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(255,255,255,0.92)",
                    color: "#2F3E2F",
                    fontSize: "clamp(16px, 2vw, 26px)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    boxShadow: "0 18px 38px rgba(58,90,64,0.16)",
                    border: "1px solid rgba(58,90,64,0.12)",
                    backdropFilter: "blur(8px)",
                    opacity:
                      chipExitProgress >= 1 ? 0 : chipAppearProgress,
                    transform: `
                      translate(-50%, -50%)
                      translate(${x}vw, ${y}vh)
                      rotate(${chip.rotate * chipExitProgress}deg)
                      scale(${0.94 + chipAppearProgress * 0.06})
                    `,
                  }}
                >
                  {chip.label}
                </div>
              );
            })}
          </div>

          {/* Solution statement: exact same center point, appears only after problem is gone */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: `${50 - solutionMoveUpProgress * 90}%`,
                transform: "translate(-50%, -50%)",
                width: "min(980px, 92vw)",
                zIndex: 60,
                opacity: solutionReveal,
                padding: "0 24px",
                pointerEvents: "none",
                textAlign: "center",
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

          {/* Video slides up from bottom. Frames play only once video is fully visible. */}
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

      {/* SECTION 2: PRODUCT STORY */}
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
                {/* PRODUCT VISUAL */}
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
                  {/* soft background glow */}
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

                  {/* LEFT CALLOUT */}
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

                  {/* RIGHT CALLOUT */}
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

                  {/* PRODUCT IMAGE */}
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

                {/* PRODUCT TEXT */}
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

      {/* SECTION 3: CTA */}
      <section
        style={{
          minHeight: "100vh",
          backgroundColor: "#3A5A40",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: "clamp(48px, 9vw, 120px)",
              lineHeight: 0.9,
              letterSpacing: "-0.08em",
            }}
          >
            Ready for better hair days?
          </h2>

          <p
            style={{
              maxWidth: "680px",
              margin: "0 auto 32px",
              fontSize: "clamp(18px, 2vw, 26px)",
              lineHeight: 1.5,
              opacity: 0.9,
            }}
          >
            Start with the right foundation and build a routine that actually
            fits your concern.
          </p>

          <Link href="/collections" style={{ textDecoration: "none" }}>
            <button
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "16px 28px",
                backgroundColor: "#FFE5D4",
                color: "#2F3E2F",
                fontWeight: 900,
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Build My Routine
            </button>
          </Link>
        </div>
      </section>

      {/* SECTION 4: REVIEWS */}
      <section
        ref={reviewRef}
        style={{
          position: "relative",
          minHeight: `${Math.max(reviews.length, 1) * 100}vh`,
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
          {isLoading && (
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
              Loading reviews...
            </div>
          )}

          {!isLoading && reviews.length === 0 && (
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
          )}

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
        </div>
      </section>

{/* FOOTER */}
<footer
  style={{
    backgroundColor: "#FFFFFF",
    padding: isMobile ? "48px 24px" : "64px 80px",
    color: "#7A7A7A",
    fontFamily: "Arial, sans-serif",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "1.6fr 1fr 1fr 1fr 1fr",
      gap: isMobile ? "36px" : "56px",
      maxWidth: "1400px",
      margin: "0 auto",
    }}
  >
    <div>
      <img
        src="/logo.png"
        alt="Logo"
        style={{
          width: "90px",
          height: "auto",
          marginBottom: "28px",
        }}
      />

      <p style={{ fontSize: "18px", lineHeight: 1.6, marginBottom: "28px" }}>
        Be yourself, follow your heart! In yogic sense, the phrase “be yourself
        – follow your heart” has a deeper meaning.
      </p>

      <p style={{ fontSize: "18px", lineHeight: 1.5 }}>
        📍 Ayurveda consultant | Panchkarma specialist Ahmedabad -
        Satellite/Naranpura
      </p>

      <p style={{ fontSize: "18px", lineHeight: 1.5 }}>
        📱 Phone: (+91) 84870 79480
      </p>
    </div>

    <div>
      <h3 style={footerHeadingStyle}>RECENT POSTS</h3>
    </div>

    <div>
      <h3 style={footerHeadingStyle}>OUR STORES</h3>
      <FooterLink text="Satellite" />
      <FooterLink text="Naranpura" />
    </div>

    <div>
      <h3 style={footerHeadingStyle}>USEFUL LINKS</h3>
      <FooterLink text="Privacy Policy" />
      <FooterLink text="Returns" />
      <FooterLink text="Terms & Conditions" />
      <FooterLink text="Contact Us" />
    </div>

    <div>
      <h3 style={footerHeadingStyle}>FOOTER MENU</h3>
      <FooterLink text="Instagram profile" />
      <FooterLink text="Shop" />
      <FooterLink text="Contact Us" />
      <FooterLink text="Blog" />
    </div>
  </div>
</footer>
    </main>
  );
}