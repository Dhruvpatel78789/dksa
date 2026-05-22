"use client";

import Link from "next/link";
import FloatingActions from "../components/FloatingActions";
import { useSearchParams } from "next/navigation";

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        padding: "clamp(88px, 10vw, 120px) clamp(22px, 5vw, 56px)",
        fontFamily: "Arial, sans-serif",
        color: "#111",
        display: "grid",
        placeItems: "center",
      }}
    >
      <FloatingActions />

      <section
        style={{
          maxWidth: 720,
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: 42,
          padding: "clamp(28px, 5vw, 52px)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, opacity: 0.6, fontWeight: 900 }}>
          Order Created
        </p>

        <h1
          style={{
            margin: "10px 0 20px",
            fontSize: "clamp(54px, 10vw, 96px)",
            lineHeight: 0.85,
            letterSpacing: "-0.08em",
          }}
        >
          thank you
        </h1>

        {orderId && (
          <p style={{ color: "rgba(255,255,255,0.68)" }}>
            Order ID: {orderId}
          </p>
        )}

        <Link
          href="/collections"
          style={{
            display: "inline-block",
            marginTop: 24,
            borderRadius: 999,
            padding: "15px 24px",
            backgroundColor: "#FFE5D4",
            color: "#111",
            textDecoration: "none",
            fontWeight: 900,
          }}
        >
          Continue Shopping
        </Link>
      </section>
    </main>
  );
}