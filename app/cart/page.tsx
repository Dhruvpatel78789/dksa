"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FloatingActions from "../components/FloatingActions";

type CartItem = {
  productId: string;
  name: string;
  photo?: string;
  price: number;
  discountPercentage: number;
  size: string;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    try {
      const res = await fetch("/api/cart", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || "Failed to load cart");
        setCart([]);
        return;
      }

      setCart(data.items || []);
    } catch (error) {
      console.error("LOAD CART ERROR:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const discountedPrice =
        item.price - (item.price * (item.discountPercentage || 0)) / 100;

      return sum + discountedPrice * item.quantity;
    }, 0);
  }, [cart]);
async function updateQuantity(
  productId: string,
  size: string,
  quantity: number
) {
  if (quantity <= 0) {
    removeItem(productId, size);
    return;
  }

  const nextCart = cart.map((item) => {
    if (
      item.productId === productId &&
      item.size === size
    ) {
      return {
        ...item,
        quantity,
      };
    }

    return item;
  });

  setCart(nextCart);

  await fetch("/api/cart/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: nextCart,
    }),
  });

  window.dispatchEvent(
    new Event("cartUpdated")
  );
}

async function removeItem(
  productId: string,
  size: string
) {
  const nextCart = cart.filter(
    (item) =>
      !(
        item.productId === productId &&
        item.size === size
      )
  );

  setCart(nextCart);

  await fetch("/api/cart/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: nextCart,
    }),
  });

  window.dispatchEvent(
    new Event("cartUpdated")
  );
}
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        padding: "clamp(24px, 5vw, 56px)",
        fontFamily: "Arial, sans-serif",
        color: "#111",
      }}
    >
      <FloatingActions />

      <header style={{ maxWidth: 1200, margin: "0 auto 36px" }}>
        

        <h1
          style={{
            margin: "20px 0 0",
            fontSize: "clamp(54px, 10vw, 120px)",
            lineHeight: 0.85,
            letterSpacing: "-0.08em",
          }}
        >
          your cart
        </h1>
      </header>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 28,
        }}
        className="cart-grid"
      >
        <div style={{ display: "grid", gap: 18 }}>
          {loading ? (
            <div style={panelStyle}>Loading cart...</div>
          ) : cart.length === 0 ? (
            <div style={panelStyle}>Your cart is empty.</div>
          ) : (
            cart.map((item) => {
              const discountedPrice =
                item.price -
                (item.price * (item.discountPercentage || 0)) / 100;

              return (
                <article
                  key={`${item.productId}-${item.size}`}
                  style={panelStyle}
                >
                  <div
                    style={{
  display: "grid",
  gridTemplateColumns: "90px 1fr",
  gap: 16,
  alignItems: "center",
}}
                  >
                    <img
                      src={item.photo || ""}
                      alt={item.name}
                      style={{
                        width: 90,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 22,
                        backgroundColor: "#E8DED2",
                      }}
                    />

                    <div>
                      <h2 style={{ margin: "0 0 8px" }}>{item.name}</h2>

                      <p style={{ margin: "0 0 8px", color: "#666" }}>
                        Size: {item.size || "Default"}
                      </p>

                      {item.discountPercentage > 0 ? (
                        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
                          <span
                            style={{
                              color: "#6B705C",
                              textDecoration: "line-through",
                              fontSize: 14,
                            }}
                          >
                            ₹{item.price}
                          </span>
                          <strong>₹{Math.round(discountedPrice)}</strong>
                          <span
                            style={{
                              color: "#3A5A40",
                              fontWeight: 900,
                              fontSize: 12,
                            }}
                          >
                            {item.discountPercentage}% OFF
                          </span>
                        </div>
                      ) : (
                        <strong>₹{item.price}</strong>
                      )}
                    </div>

                    <div
                        style={{
                            gridColumn: "1 / -1",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            marginTop: 14,
                        }}
                        >
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <button
      onClick={() =>
        updateQuantity(
          item.productId,
          item.size,
          item.quantity - 1
        )
      }
      style={qtyBtn}
    >
      -
    </button>

    <strong>{item.quantity}</strong>

    <button
      onClick={() =>
        updateQuantity(
          item.productId,
          item.size,
          item.quantity + 1
        )
      }
      style={qtyBtn}
    >
      +
    </button>
  </div>

  <button
    onClick={() =>
      removeItem(
        item.productId,
        item.size
      )
    }
    style={{
      border: "none",
      background: "transparent",
      color: "#9B2C2C",
      cursor: "pointer",
      fontWeight: 900,
    }}
  >
    Remove
  </button>
</div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <aside style={summaryStyle}>
          <p style={{ margin: 0, opacity: 0.6, fontWeight: 900 }}>
            01/ Summary
          </p>

          <h2
            style={{
              margin: "10px 0 24px",
              fontSize: 54,
              lineHeight: 0.9,
              letterSpacing: "-0.07em",
            }}
          >
            order total
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 22,
              marginBottom: 26,
            }}
          >
            <span>Total</span>
            <strong>₹{Math.round(total)}</strong>
          </div>

          <button
            onClick={() => {
                window.location.href = "/checkout";
            }}
            style={{
                width: "100%",
                border: "none",
                borderRadius: 999,
                padding: "16px 20px",
                backgroundColor: "#FFE5D4",
                color: "#111",
                fontWeight: 900,
                cursor: "pointer",
            }}
            >
            Checkout
            </button>
        </aside>
      </section>

      <style jsx>{`
        @media (max-width: 900px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 32,
  padding: 18,
  boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
};

const summaryStyle: React.CSSProperties = {
  backgroundColor: "#111",
  color: "#fff",
  borderRadius: 36,
  padding: 28,
  height: "fit-content",
  position: "sticky",
  top: 24,
};

const qtyBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "none",
  backgroundColor: "#111",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};