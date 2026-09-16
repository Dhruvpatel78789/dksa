"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import FloatingActions from "@/app/components/FloatingActions";
import Footer from "@/app/components/Footer";
import { slugify } from "@/lib/normalize";

type Product = {
  _id: string;
  name: string;
  slug?: string;
  category?: string;
  description: string;
  howToUse: string;
  photos: string[];
  price?: number;
  discountPercentage?: number;
  discountedPrice?: number;
  ingredients?: {
    name: string;
    imageUrl: string;
  }[];
  sizes?: {
    size: string;
    qty: number;
    price?: number;
    discountedPrice?: number;
  }[];
};

type Review = {
  _id: string;
  name?: string;
  review?: string;
  type: "text" | "image" | "video";
  mediaUrl?: string;
  product?: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const rawSlug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [reviewType, setReviewType] = useState<"text" | "image" | "video">("text");
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  async function addToCart() {
    if (!product) return;

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          size: selectedSize,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.setItem(
            "pending_cart_item",
            JSON.stringify({
              productId: product._id,
              quantity,
              size: selectedSize,
            })
          );
          window.location.href = "/account?next=/cart";
          return;
        }

        alert(data.error || "Failed to add to cart");
        return;
      }

      window.dispatchEvent(new Event("cartUpdated"));

      // Trigger left-side Cart Drawer popup with item info
      const activePhoto = product.photos?.[0] || "";
      const currentPrice = pricing.discountedPrice || pricing.price;

      window.dispatchEvent(
        new CustomEvent("openCartDrawer", {
          detail: {
            name: product.name,
            photo: activePhoto,
            size: selectedSize,
            quantity,
            price: Math.round(currentPrice),
          },
        })
      );

      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 1200);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);

        const res = await fetch(`/api/user/products/${encodeURIComponent(rawSlug)}`);
        const data = await res.json();

        if (data.product) {
          setProduct(data.product);

          if (data.product.sizes?.length > 0) {
            setSelectedSize(data.product.sizes[0].size);
          }

          const reviewRes = await fetch(
            `/api/user/reviews?product=${encodeURIComponent(data.product.name)}`
          );

          const reviewData = await reviewRes.json();
          setReviews(reviewData.reviews || []);

          const suggestedRes = await fetch("/api/user/products");
          const suggestedData = await suggestedRes.json();

          if (suggestedRes.ok) {
            setSuggestedProducts(
              (suggestedData.products || [])
                .filter((item: Product) => item._id !== data.product._id)
                .slice(0, 4)
            );
          }
        }
      } catch (error) {
        console.error("PRODUCT PAGE ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [rawSlug]);

  const pricing = useMemo(() => {
    const sizeObj = product?.sizes?.find((s) => s.size === selectedSize);
    const price = sizeObj && sizeObj.price !== undefined ? sizeObj.price : product?.price || 0;

    let discountedPrice = price;
    if (sizeObj) {
      if (sizeObj.discountedPrice !== undefined) {
        discountedPrice = sizeObj.discountedPrice;
      } else if (product?.discountPercentage) {
        discountedPrice = price - (price * product.discountPercentage) / 100;
      }
    } else {
      if (product?.discountedPrice !== undefined && product.discountedPrice > 0) {
        discountedPrice = product.discountedPrice;
      } else if (product?.price && product.discountPercentage) {
        discountedPrice = product.price - (product.price * product.discountPercentage) / 100;
      }
    }

    const discount = price > discountedPrice ? Math.round(price - discountedPrice) : 0;

    return {
      price,
      discount,
      discountedPrice,
    };
  }, [product, selectedSize]);

  if (loading) {
    return (
      <main style={centerPageStyle}>
        <FloatingActions />
        <p style={{ fontSize: "18px", fontWeight: 800 }}>Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={centerPageStyle}>
        <FloatingActions />
        <p style={{ fontSize: "18px", fontWeight: 800 }}>Product not found.</p>
      </main>
    );
  }

  const activePhoto = product.photos?.[activeImage];
  const productSlug = product.slug || slugify(product.name);

  // SEO JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.photos || [],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "Shashwat Ayurvedam",
    },
    offers: {
      "@type": "Offer",
      url: `https://shashwatayurvedam.com/product/${productSlug}/`,
      priceCurrency: "INR",
      price: Math.round(pricing.discountedPrice || pricing.price),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        color: "#111",
        fontFamily: "Arial, sans-serif",
        overflowX: "clip",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FloatingActions />

      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "clamp(18px, 4vw, 44px)",
          paddingTop: 110,
        }}
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.08fr) minmax(360px, 0.92fr)",
            gap: "clamp(24px, 5vw, 56px)",
            alignItems: "start",
          }}
          className="product-main-grid"
        >
          <div>
            <div
              style={{
                position: "relative",
                borderRadius: "clamp(30px, 5vw, 58px)",
                overflow: "hidden",
                backgroundColor: "#EEE8DD",
                minHeight: "clamp(430px, 64vw, 720px)",
                boxShadow: "0 28px 80px rgba(0,0,0,0.08)",
              }}
            >
              {activePhoto ? (
                <img
                  src={activePhoto}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    inset: 0,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    color: "#6B705C",
                    fontWeight: 900,
                  }}
                >
                  No Image
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  top: 22,
                  left: 22,
                  backgroundColor: "#111",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "9px 14px",
                  fontWeight: 900,
                  fontSize: 13,
                  textTransform: "uppercase",
                }}
              >
                {product.category || "product"}
              </div>

              {pricing.discount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    right: 22,
                    backgroundColor: "#F7EFE7",
                    color: "#111",
                    borderRadius: 999,
                    padding: "9px 14px",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  ₹{pricing.discount} OFF
                </div>
              )}
            </div>

            {product.photos?.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "auto",
                  paddingTop: 16,
                  paddingBottom: 4,
                }}
              >
                {product.photos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    onClick={() => setActiveImage(index)}
                    style={{
                      width: 88,
                      height: 88,
                      flexShrink: 0,
                      borderRadius: 22,
                      overflow: "hidden",
                      border:
                        activeImage === index
                          ? "3px solid #111"
                          : "2px solid transparent",
                      padding: 0,
                      cursor: "pointer",
                      backgroundColor: "#EEE8DD",
                    }}
                  >
                    <img
                      src={photo}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside
            style={{
              position: "sticky",
              top: 110,
              backgroundColor: "#3A5A40",
              color: "#fff",
              borderRadius: "clamp(30px, 5vw, 48px)",
              padding: "clamp(24px, 4vw, 42px)",
              boxShadow: "0 28px 80px rgba(0,0,0,0.12)",
            }}
            className="product-info-card"
          >
            <p
              style={{
                margin: "0 0 12px",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 900,
              }}
            >
              Product
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(42px, 6vw, 76px)",
                lineHeight: 0.9,
                letterSpacing: "-0.06em",
              }}
            >
              {product.name}
            </h1>

            <p
              style={{
                margin: "24px 0 0",
                color: "rgba(255,255,255,0.75)",
                fontSize: 17,
                lineHeight: 1.65,
              }}
            >
              {product.description}
            </p>

            <div style={{ marginTop: 28 }}>
              {pricing.discount > 0 ? (
                <>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      textDecoration: "line-through",
                      fontSize: 26,
                      marginRight: 14,
                    }}
                  >
                    ₹{pricing.price}
                  </span>
                  <strong style={{ fontSize: 38 }}>
                    ₹{Math.round(pricing.discountedPrice)}
                  </strong>
                  <span
                    style={{
                      marginLeft: 14,
                      color: "#FFE5D4",
                      fontWeight: 900,
                    }}
                  >
                    Save ₹{pricing.discount}
                  </span>
                </>
              ) : (
                <strong style={{ fontSize: 38 }}>
                  ₹{pricing.price}
                </strong>
              )}
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginTop: 30 }}>
                <h3 style={{ margin: "0 0 12px" }}>Size</h3>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {product.sizes.map((sizeItem) => (
                    <button
                      key={sizeItem.size}
                      onClick={() => setSelectedSize(sizeItem.size)}
                      disabled={sizeItem.qty <= 0}
                      style={{
                        border:
                          selectedSize === sizeItem.size
                            ? "2px solid #FFE5D4"
                            : "1px solid rgba(255,255,255,0.25)",
                        backgroundColor:
                          selectedSize === sizeItem.size
                            ? "#FFE5D4"
                            : "transparent",
                        color:
                          selectedSize === sizeItem.size ? "#111" : "#fff",
                        opacity: sizeItem.qty <= 0 ? 0.35 : 1,
                        padding: "12px 16px",
                        borderRadius: 999,
                        cursor: sizeItem.qty <= 0 ? "not-allowed" : "pointer",
                        fontWeight: 900,
                      }}
                    >
                      {sizeItem.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 30 }}>
              <h3 style={{ margin: "0 0 12px" }}>Quantity</h3>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 18,
                  backgroundColor: "#fff",
                  color: "#111",
                  borderRadius: 999,
                  padding: "8px 12px",
                }}
              >
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  style={qtyButtonStyle}
                >
                  -
                </button>

                <strong>{quantity}</strong>

                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  style={qtyButtonStyle}
                >
                  +
                </button>
              </div>
            </div>

            {(() => {
              const selectedSizeObj = product.sizes?.find((s) => s.size === selectedSize);
              const isSoldOut = selectedSizeObj
                ? selectedSizeObj.qty <= 0
                : product.sizes && product.sizes.length > 0
                ? product.sizes.every((s) => s.qty <= 0)
                : false;

              return (
                <button
                  onClick={addToCart}
                  disabled={isSoldOut || added}
                  style={{
                    width: "100%",
                    marginTop: 34,
                    padding: "18px 24px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: isSoldOut ? "#6B705C" : "#FFE5D4",
                    color: isSoldOut ? "#FAF7F2" : "#111",
                    fontWeight: 900,
                    fontSize: 16,
                    cursor: isSoldOut ? "not-allowed" : "pointer",
                    transform: added ? "scale(0.96)" : "scale(1)",
                    transition: "all 220ms ease",
                    opacity: isSoldOut ? 0.65 : 1,
                  }}
                >
                  {isSoldOut ? "Sold Out" : added ? "Added ✓" : "Add To Cart"}
                </button>
              );
            })()}
          </aside>
        </section>

        {product.howToUse && (
          <section style={splitSectionStyle} className="product-split-section">
            <div>
              <p style={sectionKickerStyle}>How to use</p>
              <h2 style={sectionTitleStyle}>simple routine, clear steps</h2>
            </div>
            <p style={sectionBodyStyle}>{product.howToUse}</p>
          </section>
        )}

        {product.ingredients && product.ingredients.length > 0 && (
          <section style={{ marginTop: 54 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 24,
                alignItems: "end",
                marginBottom: 22,
              }}
            >
              <div>
                <p style={sectionKickerStyle}>Ingredients</p>
                <h2 style={sectionTitleStyle}>what it is made of</h2>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 18,
                overflowX: "auto",
                paddingBottom: 8,
              }}
            >
              {product.ingredients.map((ingredient, index) => (
                <article
                  key={`${ingredient.name}-${index}`}
                  style={{
                    minWidth: 190,
                    backgroundColor: "#F3F0E8",
                    borderRadius: 32,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      height: 170,
                      borderRadius: 24,
                      overflow: "hidden",
                      backgroundColor: "#DDD6CA",
                      marginBottom: 12,
                    }}
                  >
                    {ingredient.imageUrl && (
                      <img
                        src={ingredient.imageUrl}
                        alt={ingredient.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontWeight: 900,
                      textAlign: "center",
                    }}
                  >
                    {ingredient.name}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}

const centerPageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  backgroundColor: "#F7EFE7",
  fontFamily: "Arial, sans-serif",
};

const splitSectionStyle: React.CSSProperties = {
  marginTop: 54,
  backgroundColor: "#FFFFFF",
  borderRadius: 36,
  padding: "42px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 32,
  boxShadow: "0 18px 45px rgba(0,0,0,0.06)",
};

const sectionKickerStyle: React.CSSProperties = {
  margin: 0,
  color: "#6B705C",
  fontWeight: 900,
  textTransform: "uppercase",
  fontSize: 13,
  letterSpacing: "0.08em",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "clamp(32px, 5vw, 54px)",
  lineHeight: 0.95,
  letterSpacing: "-0.06em",
};

const sectionBodyStyle: React.CSSProperties = {
  margin: 0,
  color: "#555",
  fontSize: 18,
  lineHeight: 1.6,
};

const qtyButtonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "none",
  backgroundColor: "#F0F0F0",
  color: "#111",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 18,
};
