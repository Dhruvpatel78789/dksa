"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  productId: string;
  name: string;
  photo?: string;
  price: number;
  discountPercentage: number;
  discountedPrice?: number;
  size: string;
  quantity: number;
};

type AddedProductInfo = {
  name: string;
  photo?: string;
  size?: string;
  quantity: number;
  price: number;
};

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAdded, setLastAdded] = useState<AddedProductInfo | null>(null);

  async function fetchCart() {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    function handleOpenDrawer(e: any) {
      if (e.detail) {
        setLastAdded(e.detail);
      }
      fetchCart();
      setIsOpen(true);
    }

    window.addEventListener("openCartDrawer", handleOpenDrawer);
    return () => {
      window.removeEventListener("openCartDrawer", handleOpenDrawer);
    };
  }, []);

  const subtotal = cartItems.reduce((sum, item) => {
    const discountedPrice =
      item.discountedPrice !== undefined
        ? item.discountedPrice
        : item.price - (item.price * (item.discountPercentage || 0)) / 100;
    return sum + discountedPrice * item.quantity;
  }, 0);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        display: "flex",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Left Drawer Panel */}
      <aside
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(420px, 88vw)",
          height: "100%",
          backgroundColor: "#FFFFFF",
          color: "#111111",
          boxShadow: "6px 0 30px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          boxSizing: "border-box",
          animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            borderBottom: "1px solid #EEEEEE",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 900,
                color: "#3A5A40",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Item Added To Cart
            </span>
            <h2
              style={{
                margin: "4px 0 0",
                fontSize: "24px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              Your Cart
            </h2>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#F4F4F4",
              color: "#111",
              fontSize: "18px",
              fontWeight: 900,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            ✕
          </button>
        </header>

        {/* Recently Added Alert Banner */}
        {lastAdded && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#EAF4EC",
              borderRadius: "16px",
              border: "1px solid #C8E6C9",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {lastAdded.photo && (
              <img
                src={lastAdded.photo}
                alt={lastAdded.name}
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {lastAdded.name}
              </p>
              <span style={{ fontSize: "12px", color: "#455A64" }}>
                Qty: {lastAdded.quantity} {lastAdded.size ? `(${lastAdded.size})` : ""} — ₹{lastAdded.price}
              </span>
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            margin: "20px 0",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#777777",
              }}
            >
              Your cart is empty.
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const itemPrice =
                item.discountedPrice !== undefined
                  ? item.discountedPrice
                  : item.price - (item.price * (item.discountPercentage || 0)) / 100;

              return (
                <div
                  key={`${item.productId}-${idx}`}
                  style={{
                    display: "flex",
                    gap: "14px",
                    padding: "12px",
                    backgroundColor: "#F9F9F9",
                    borderRadius: "18px",
                  }}
                >
                  <img
                    src={item.photo || "/logo.png"}
                    alt={item.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      backgroundColor: "#EEE",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        margin: "0 0 4px",
                        fontSize: "14px",
                        fontWeight: 900,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </h4>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#666" }}>
                      Size: {item.size || "Default"} | Qty: {item.quantity}
                    </p>
                    <strong style={{ fontSize: "14px", color: "#3A5A40" }}>
                      ₹{Math.round(itemPrice * item.quantity)}
                    </strong>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Actions */}
        <footer
          style={{
            borderTop: "1px solid #EEEEEE",
            paddingTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "18px",
              fontWeight: 900,
            }}
          >
            <span>Subtotal:</span>
            <span>₹{Math.round(subtotal)}</span>
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "#888888" }}>
            Taxes (GST) and shipping calculated at checkout
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              style={{
                textAlign: "center",
                padding: "14px",
                borderRadius: "999px",
                backgroundColor: "#F0F0F0",
                color: "#111111",
                fontWeight: 900,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              View Cart
            </Link>

            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              style={{
                textAlign: "center",
                padding: "14px",
                borderRadius: "999px",
                backgroundColor: "#3A5A40",
                color: "#FFFFFF",
                fontWeight: 900,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Checkout
            </Link>
          </div>
        </footer>

        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </aside>
    </div>
  );
}
