"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import FloatingActions from "../../components/FloatingActions";

type Product = {
  _id: string;
  name: string;
  category?: string;
  description: string;
  howToUse: string;
  photos: string[];
  price?: number;
  discountPercentage?: number;
  ingredients?: {
    name: string;
    imageUrl: string;
  }[];
  sizes?: {
    size: string;
    qty: number;
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

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

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
          window.location.href = `/account?next=/products/${product._id}`;
          return;
        }

        alert(data.error || "Failed to add to cart");
        return;
      }

      window.dispatchEvent(new Event("cartUpdated"));

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

        const res = await fetch(`/api/user/products/${id}`);
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
  }, [id]);

  const pricing = useMemo(() => {
    const price = product?.price || 0;
    const discount = product?.discountPercentage || 0;
    const discountedPrice = price - (price * discount) / 100;

    return {
      price,
      discount,
      discountedPrice,
    };
  }, [product]);

  if (loading) {
    return (
      <main style={centerPageStyle}>
        <FloatingActions />
        <p>Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={centerPageStyle}>
        <FloatingActions />
        <p>Product not found.</p>
      </main>
    );
  }

  const activePhoto = product.photos?.[activeImage];

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
                  {pricing.discount}% OFF
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
                      alt=""
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
                fontSize: "clamp(54px, 8vw, 96px)",
                lineHeight: 0.82,
                letterSpacing: "-0.09em",
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
              <strong style={{ fontSize: 38 }}>
                ₹{Math.round(pricing.discountedPrice)}
              </strong>

              {pricing.discount > 0 && (
                <>
                  <span
                    style={{
                      marginLeft: 12,
                      color: "rgba(255,255,255,0.45)",
                      textDecoration: "line-through",
                      fontSize: 20,
                    }}
                  >
                    ₹{pricing.price}
                  </span>

                  <span
                    style={{
                      marginLeft: 12,
                      color: "#FFE5D4",
                      fontWeight: 900,
                    }}
                  >
                    Save {pricing.discount}%
                  </span>
                </>
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

            <button
              onClick={addToCart}
              style={{
                width: "100%",
                marginTop: 34,
                padding: "18px 24px",
                borderRadius: 999,
                border: "none",
                backgroundColor: "#FFE5D4",
                color: "#111",
                fontWeight: 900,
                fontSize: 16,
                cursor: "pointer",
                transform: added ? "scale(0.96)" : "scale(1)",
                transition: "all 220ms ease",
              }}
            >
              {added ? "Added ✓" : "Add To Cart"}
            </button>
          </aside>
        </section>

        <section style={splitSectionStyle} className="product-split-section">
          <div>
            <p style={sectionKickerStyle}>How to use</p>
            <h2 style={sectionTitleStyle}>simple routine, clear steps</h2>
          </div>

          <p style={sectionBodyStyle}>{product.howToUse}</p>
        </section>

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

        <section
          style={{
            marginTop: 58,
            backgroundColor: "#3A5A40",
            color: "#fff",
            borderRadius: "clamp(30px, 5vw, 52px)",
            padding: "clamp(24px, 5vw, 48px)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 900,
            }}
          >
            Reviews
          </p>

          <h2
            style={{
              margin: "8px 0 28px",
              fontSize: "clamp(44px, 8vw, 96px)",
              lineHeight: 0.88,
              letterSpacing: "-0.08em",
            }}
          >
            what people say
          </h2>

          {reviews.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.65)" }}>
              No reviews yet for this product.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 18,
                overflowX: "auto",
                paddingBottom: 8,
              }}
            >
              {reviews.map((review) => (
                <article
                  key={review._id}
                  style={{
                    minWidth: 300,
                    maxWidth: 360,
                    backgroundColor: "#F7EFE7",
                    color: "#111",
                    borderRadius: 32,
                    padding: 18,
                  }}
                >
                  {review.type === "image" && review.mediaUrl && (
                    <img
                      src={review.mediaUrl}
                      alt="Review"
                      style={reviewMediaStyle}
                    />
                  )}

                  {review.type === "video" && review.mediaUrl && (
                    <video
                      src={review.mediaUrl}
                      controls
                      muted
                      playsInline
                      style={reviewMediaStyle}
                    />
                  )}

                  <strong>{review.name || "Customer"}</strong>

                  {review.review && (
                    <p
                      style={{
                        color: "#444",
                        lineHeight: 1.55,
                        marginBottom: 0,
                      }}
                    >
                      {review.review}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {suggestedProducts.length > 0 && (
          <section
            style={{
              marginTop: 64,
              paddingBottom: 80,
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                color: "#6B705C",
                fontWeight: 900,
              }}
            >
              Suggested Products
            </p>

            <h2
              style={{
                margin: "0 0 28px",
                fontSize: "clamp(48px, 8vw, 92px)",
                lineHeight: 0.9,
                letterSpacing: "-0.08em",
                color: "#111",
              }}
            >
              you may also like
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 22,
              }}
            >
              {suggestedProducts.map((item) => {
                const price = item.price || 0;
                const discount = item.discountPercentage || 0;
                const discountedPrice = price - (price * discount) / 100;

                return (
                  <Link
                    key={item._id}
                    href={`/products/${item._id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <article
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 34,
                        overflow: "hidden",
                        boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
                      }}
                    >
                      <div
                        style={{
                          height: 280,
                          backgroundColor: "#EFE7DD",
                          overflow: "hidden",
                        }}
                      >
                        {item.photos?.[0] ? (
                          <img
                            src={item.photos[0]}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "grid",
                              placeItems: "center",
                              color: "#6B705C",
                              fontWeight: 900,
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </div>

                      <div style={{ padding: 22 }}>
                        <p
                          style={{
                            margin: "0 0 8px",
                            color: "#6B705C",
                            fontWeight: 900,
                          }}
                        >
                          {item.category || "Product"}
                        </p>

                        <h3
                          style={{
                            margin: "0 0 12px",
                            fontSize: 32,
                            lineHeight: 0.95,
                            letterSpacing: "-0.06em",
                          }}
                        >
                          {item.name}
                        </h3>

                        <strong style={{ fontSize: 26 }}>
                          ₹{Math.round(discountedPrice)}
                        </strong>

                        {discount > 0 && (
                          <span
                            style={{
                              marginLeft: 10,
                              color: "#6B705C",
                              fontWeight: 900,
                            }}
                          >
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .product-main-grid {
            grid-template-columns: 1fr !important;
          }

          .product-info-card {
            position: relative !important;
            top: auto !important;
          }

          .product-split-section {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const centerPageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  backgroundColor: "#F7EFE7",
  color: "#111",
  fontFamily: "Arial, sans-serif",
};

const qtyButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "none",
  backgroundColor: "#111",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 18,
};

const splitSectionStyle: React.CSSProperties = {
  marginTop: 58,
  backgroundColor: "#111",
  color: "#fff",
  borderRadius: "clamp(30px, 5vw, 52px)",
  padding: "clamp(24px, 5vw, 48px)",
  display: "grid",
  gridTemplateColumns: "0.8fr 1.2fr",
  gap: 28,
  alignItems: "start",
};

const sectionKickerStyle: React.CSSProperties = {
  margin: 0,
  color: "#6B705C",
  fontWeight: 900,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "clamp(38px, 7vw, 82px)",
  lineHeight: 0.9,
  letterSpacing: "-0.08em",
};

const sectionBodyStyle: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.72)",
  fontSize: 18,
  lineHeight: 1.7,
};

const reviewMediaStyle: React.CSSProperties = {
  width: "100%",
  height: 220,
  objectFit: "cover",
  borderRadius: 24,
  marginBottom: 14,
};