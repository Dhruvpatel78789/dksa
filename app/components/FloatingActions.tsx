"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FloatingActions() {
  const pathname = usePathname();
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  async function refreshState() {
    try {
      const userRes = await fetch("/api/auth/me", { cache: "no-store" });
      const userData = await userRes.json();
      setIsLoggedIn(Boolean(userData.user));

      const cartRes = await fetch("/api/cart", { cache: "no-store" });
      const cartData = await cartRes.json();

      const count = (cartData.items || []).reduce(
        (total: number, item: any) => total + Number(item.quantity || 0),
        0
      );

      setCartCount(count);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    refreshState();

    window.addEventListener("cartUpdated", refreshState);
    window.addEventListener("focus", refreshState);

    return () => {
      window.removeEventListener("cartUpdated", refreshState);
      window.removeEventListener("focus", refreshState);
    };
  }, []);

  return (
    <>
      {/* DESKTOP */}
      <div className="floating-desktop-left">
        <button onClick={() => router.back()} style={iconStyle}>
          ←
        </button>

        {pathname !== "/" && (
          <Link
            href="/"
            scroll={true}
            style={{
              ...iconStyle,
              backgroundColor: "#111",
              color: "#fff",
            }}
          >
            ⌂
          </Link>
        )}
      </div>

      <div className="floating-desktop-right">
        {pathname !== "/collections" && (
          <Link href="/collections" style={iconStyle}>
            🛍️
          </Link>
        )}

        {pathname !== "/cart" && (
          <Link href="/cart" style={{ ...iconStyle, position: "relative" }}>
            🛒
            {cartCount > 0 && <CartBadge count={cartCount} />}
          </Link>
        )}

        {pathname !== "/account" && (
          <Link href="/account" style={iconStyle}>
            {isLoggedIn ? "✓" : "👤"}
          </Link>
        )}
      </div>
{/* MOBILE LEFT BACK */}
<div className="floating-mobile-left">
  <button onClick={() => router.back()} style={iconStyle}>
    ←
  </button>
</div>
      {/* MOBILE */}
      <div className="floating-mobile">
        <button
          onClick={() => setOpen((prev) => !prev)}
          style={{
            ...iconStyle,
            backgroundColor: "#111",
            color: "#fff",
            position: "relative",
          }}
        >
          {open ? "×" : "☰"}
          {!open && cartCount > 0 && <CartBadge count={cartCount} />}
        </button>

        {open && (
          <div className="floating-mobile-menu">
            

            {pathname !== "/" && (
              <Link
                href="/"
                scroll={true}
                onClick={() => setOpen(false)}
                style={{
                  ...iconStyle,
                  backgroundColor: "#111",
                  color: "#fff",
                }}
              >
                ⌂
              </Link>
            )}

            {pathname !== "/collections" && (
              <Link
                href="/collections"
                onClick={() => setOpen(false)}
                style={iconStyle}
              >
                🛍️
              </Link>
            )}

            {pathname !== "/cart" && (
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                style={{ ...iconStyle, position: "relative" }}
              >
                🛒
                {cartCount > 0 && <CartBadge count={cartCount} />}
              </Link>
            )}

            {pathname !== "/account" && (
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                style={iconStyle}
              >
                {isLoggedIn ? "✓" : "👤"}
              </Link>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .floating-desktop-left {
          position: fixed;
          top: 22px;
          left: 22px;
          z-index: 9999;
          display: flex;
          gap: 12px;
        }

        .floating-desktop-right {
          position: fixed;
          top: 22px;
          right: 22px;
          z-index: 9999;
          display: flex;
          gap: 12px;
        }

        .floating-mobile,
        .floating-mobile-left {
        display: none;
        }

        @media (max-width: 760px) {
          .floating-desktop-left,
          .floating-desktop-right {
            display: none;
          }

          .floating-mobile-left {
            position: fixed;
            top: 18px;
            left: 18px;
            z-index: 9999;
            display: flex;
            }

          .floating-mobile {
            position: fixed;
            top: 18px;
            right: 18px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
          }

          .floating-mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.72);
            backdrop-filter: blur(16px);
            box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12);
          }
        }
      `}</style>
    </>
  );
}

function CartBadge({ count }: { count: number }) {
  return (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        minWidth: 20,
        height: 20,
        borderRadius: 999,
        backgroundColor: "#111",
        color: "#fff",
        fontSize: 12,
        fontWeight: 900,
        display: "grid",
        placeItems: "center",
        padding: "0 5px",
      }}
    >
      {count}
    </span>
  );
}

const iconStyle: React.CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.92)",
  color: "#111",
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  fontSize: 20,
  fontWeight: 900,
  border: "none",
  cursor: "pointer",
  backdropFilter: "blur(14px)",
  boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
};