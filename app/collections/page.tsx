"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FloatingActions from "../components/FloatingActions";
type Product = {
  _id: string;
  name: string;
  category?: string;
  description: string;
  photos: string[];
  price?: number;
  discountPercentage?: number;
  discountedPrice?: number;
  sizes?: {
    size: string;
    qty: number;
    price?: number;
    discountedPrice?: number;
  }[];
};

export default function CollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch("/api/user/products");
      const data = await res.json();
      setProducts(data.products || []);
      setLoading(false);
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const price = product.price || 0;

      const categoryMatch =
        category === "all" || product.category === category;

      const priceMatch =
        priceRange === "all" ||
        (priceRange === "under-1000" && price < 1000) ||
        (priceRange === "1000-2000" && price >= 1000 && price <= 2000) ||
        (priceRange === "above-2000" && price > 2000);

      return categoryMatch && priceMatch;
    });
  }, [products, category, priceRange]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        padding: "clamp(88px, 14vw, 120px) clamp(22px, 5vw, 56px) clamp(22px, 5vw, 56px)",
        fontFamily: "Arial, sans-serif",
        color: "#111",
      }}
    >
        <FloatingActions />
      <header style={{ maxWidth: 1320, margin: "0 auto 34px" }}>
       
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 32,
  }}
>
  <h1
    style={{
      margin: "8px 0 18px",
      fontSize: "clamp(54px, 12vw, 132px)",
      lineHeight: 0.85,
      letterSpacing: "-0.09em",
    }}
  >
    build your routine
  </h1>

  <div
    style={{
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      style={filterStyle}
    >
      {categories.map((cat) => (
        <option key={cat} value={cat}>
          {cat === "all" ? "All categories" : cat}
        </option>
      ))}
    </select>

    <select
      value={priceRange}
      onChange={(e) => setPriceRange(e.target.value)}
      style={filterStyle}
    >
      <option value="all">All prices</option>
      <option value="under-1000">Under ₹1000</option>
      <option value="1000-2000">₹1000 - ₹2000</option>
      <option value="above-2000">Above ₹2000</option>
    </select>
  </div>
</div>
      </header>

      <section style={{ maxWidth: 1320, margin: "0 auto" }}>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredProducts.map((product) => {
              const image = product.photos?.[0];
              
              const sizeObj = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
              const price = sizeObj && sizeObj.price !== undefined ? sizeObj.price : (product.price || 0);

              let discountedPrice = price;
              if (sizeObj) {
                if (sizeObj.discountedPrice !== undefined) {
                  discountedPrice = sizeObj.discountedPrice;
                } else if (product.discountPercentage) {
                  discountedPrice = price - (price * product.discountPercentage) / 100;
                }
              } else {
                if (product.discountedPrice !== undefined && product.discountedPrice > 0) {
                  discountedPrice = product.discountedPrice;
                } else if (product.discountPercentage) {
                  discountedPrice = price - (price * product.discountPercentage) / 100;
                }
              }

              const discountAmount = price > discountedPrice ? Math.round(price - discountedPrice) : 0;

              return (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: 32,
                      padding: 16,
                      minHeight: 420,
                      boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      style={{
                        height: 285,
                        borderRadius: 26,
                        overflow: "hidden",
                        backgroundColor: "#DDD6CA",
                      }}
                    >
                      {image && (
                        <img
                          src={image}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>

                    <div style={{ padding: "16px 6px 4px" }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          color: "#6B705C",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {product.category || "product"}
                      </p>

                      <h2
                        style={{
                          margin: "0 0 8px",
                          fontSize: 30,
                          lineHeight: 0.95,
                          letterSpacing: "-0.06em",
                        }}
                      >
                        {product.name}
                      </h2>

                      <p
                        style={{
                            margin: "0 0 14px",
                            color: "#555",
                            fontSize: 14,
                            lineHeight: 1.45,

                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        >
                        {product.description}
                        </p>

                      {discountAmount > 0 ? (
                        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
                          <span
                            style={{
                              color: "#6B705C",
                              textDecoration: "line-through",
                              fontSize: 16,
                            }}
                          >
                            ₹{price}
                          </span>
                          <strong style={{ fontSize: 22 }}>
                            ₹{Math.round(discountedPrice)}
                          </strong>
                          <span
                            style={{
                              color: "#3A5A40",
                              fontWeight: 900,
                              fontSize: 13,
                            }}
                          >
                            Save ₹{discountAmount}
                          </span>
                        </div>
                      ) : (
                        <strong style={{ fontSize: 22 }}>
                          ₹{price}
                        </strong>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

const filterStyle: React.CSSProperties = {
  border: "1px solid #111",
  borderRadius: 999,
  padding: "11px 18px",
  backgroundColor: "#FFFFFF",
  color: "#111",
  fontWeight: 800,
};