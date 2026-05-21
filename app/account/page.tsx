"use client";

import { useEffect, useState } from "react";
import FloatingActions from "../components/FloatingActions";
import { useRouter, useSearchParams } from "next/navigation";

type Order = {
  _id: string;
  items: {
    name: string;
    quantity: number;
    size?: string;
  }[];
  total: number;
  paymentStatus: "pending" | "confirmed" | "rejected";
  orderStatus:
    | "created"
    | "ordered"
    | "shipping"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  shipment?: {
    courierName?: string;
    trackingId?: string;
    trackingUrl?: string;
    note?: string;
  };
  createdAt?: string;
};

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const isAdminLogin = next === "/admin";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  async function loadUser() {
  try {
    const res = await fetch("/api/auth/me", {
      cache: "no-store",
    });

    const data = await res.json();

    if (isAdminLogin && data.user && data.user.role !== "admin") {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setOrders([]);
      return;
    }

    setUser(data.user || null);
  } catch (error) {
    console.error(error);
  }
}
  async function loadOrders() {
  try {
    const res = await fetch("/api/orders", {
      cache: "no-store",
    });

    const data = await res.json();

    if (res.ok) {
      setOrders(data.orders || []);
    }
  } catch (error) {
    console.error(error);
  }
}

  useEffect(() => {
    loadUser();
    loadOrders();
  }, []);

  async function handleSubmit() {
    try {
      setLoading(true);
      setMessage("");

      const endpoint =
        mode === "login"
          ? "/api/auth/login"
          : "/api/auth/signup";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

        await loadUser();
        await loadOrders();

        const meRes = await fetch("/api/auth/me", {
        cache: "no-store",
        });

        const meData = await meRes.json();

        if (isAdminLogin) {
        if (meData.user?.role === "admin") {
            router.push("/admin");
        } else {
            setMessage("This login is not an admin account.");
            await fetch("/api/auth/logout", {
            method: "POST",
            });
            setUser(null);
            setOrders([]);
        }

        return;
        }

        if (next) {
          router.push(next);
          return;
        }

        if (meData.user?.role === "admin") {
          router.push("/admin");
        }
        
      setName("");
      setEmail("");
      setPassword("");

      setMessage(
        mode === "login"
          ? "Logged in successfully"
          : "Account created successfully"
      );
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setOrders([]);
    } catch (error) {
      console.error(error);
    }
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

      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          backgroundColor: "#111",
          color: "#fff",
          borderRadius: 42,
          padding: "clamp(28px, 5vw, 48px)",
        }}
      >
        <p style={{ margin: 0, opacity: 0.6, fontWeight: 900 }}>
          01/ Account
        </p>

        <h1
          style={{
            margin: "10px 0 28px",
            fontSize: "clamp(54px, 10vw, 96px)",
            lineHeight: 0.85,
            letterSpacing: "-0.08em",
          }}
        >
          {user
            ? "welcome"
            : mode === "login"
            ? "login"
            : "signup"}
        </h1>

        {user ? (
                <>
                    <p style={{ fontSize: 22 }}>
                    Hi, {user.name}
                    </p>

                    <p
                    style={{
                        color: "rgba(255,255,255,0.65)",
                    }}
                    >
                    {user.email}
                    </p>

                    <button onClick={logout} style={primaryBtn}>
                    Logout
                    </button>

                    <div style={{ marginTop: 42 }}>
                    <p style={{ margin: 0, opacity: 0.6, fontWeight: 900 }}>
                        02/ Orders
                    </p>

                    <h2
                        style={{
                        margin: "10px 0 22px",
                        fontSize: "clamp(38px, 7vw, 72px)",
                        lineHeight: 0.88,
                        letterSpacing: "-0.07em",
                        }}
                    >
                        your orders
                    </h2>

                    {orders.length === 0 ? (
                        <p style={{ color: "rgba(255,255,255,0.65)" }}>
                        No orders yet.
                        </p>
                    ) : (
                        <div style={{ display: "grid", gap: 16 }}>
                        {orders.map((order) => (
                            <article
                            key={order._id}
                            style={{
                                backgroundColor: "#F7EFE7",
                                color: "#111",
                                borderRadius: 26,
                                padding: 18,
                            }}
                            >
                            <div
                                style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 16,
                                alignItems: "start",
                                marginBottom: 14,
                                }}
                            >
                                <div>
                                <strong>Order #{order._id.slice(-6)}</strong>

                                <p style={{ margin: "6px 0 0", color: "#666" }}>
                                    Payment: {order.paymentStatus}
                                </p>

                                <p style={{ margin: "6px 0 0", color: "#666" }}>
                                    Status: {order.orderStatus}
                                </p>
                                </div>

                                <strong>₹{Math.round(order.total || 0)}</strong>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                {order.items.map((item, index) => (
                                <p key={index} style={{ margin: "6px 0" }}>
                                    {item.name} × {item.quantity}
                                    {item.size ? ` (${item.size})` : ""}
                                </p>
                                ))}
                            </div>

                            <div
                                style={{
                                borderTop: "1px solid rgba(0,0,0,0.12)",
                                paddingTop: 14,
                                }}
                            >
                                <strong>Shipment</strong>

                                {order.shipment?.courierName ||
                                order.shipment?.trackingId ||
                                order.shipment?.trackingUrl ||
                                order.shipment?.note ? (
                                <>
                                    {order.shipment?.courierName && (
                                    <p style={{ margin: "8px 0 0", color: "#555" }}>
                                        Courier: {order.shipment.courierName}
                                    </p>
                                    )}

                                    {order.shipment?.trackingId && (
                                    <p style={{ margin: "8px 0 0", color: "#555" }}>
                                        Tracking ID: {order.shipment.trackingId}
                                    </p>
                                    )}

                                    {order.shipment?.trackingUrl && (
                                    <a
                                        href={order.shipment.trackingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                        display: "inline-block",
                                        marginTop: 8,
                                        color: "#111",
                                        fontWeight: 900,
                                        }}
                                    >
                                        Track shipment
                                    </a>
                                    )}

                                    {order.shipment?.note && (
                                    <p style={{ margin: "8px 0 0", color: "#555" }}>
                                        Note: {order.shipment.note}
                                    </p>
                                    )}
                                </>
                                ) : (
                                <p style={{ margin: "8px 0 0", color: "#555" }}>
                                    Shipment details will appear here once updated.
                                </p>
                                )}
                            </div>
                            </article>
                        ))}
                        </div>
                    )}
                    </div>
                </>
                ) : (
          <>
            <div style={{ display: "grid", gap: 16 }}>
              {mode === "signup" && (
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Your name"
                  style={inputStyle}
                />
              )}

              <input
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Email address"
                type="email"
                style={inputStyle}
              />

              <input
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                type="password"
                style={inputStyle}
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={primaryBtn}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </div>

            {message && (
              <p
                style={{
                  marginTop: 18,
                  color: "#FFE5D4",
                }}
              >
                {message}
              </p>
            )}

            <button
              onClick={() => {
                setMode(
                  mode === "login"
                    ? "signup"
                    : "login"
                );

                setMessage("");
              }}
              style={{
                marginTop: 24,
                background: "transparent",
                border: "none",
                color: "#FFE5D4",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              {mode === "login"
                ? "Don't have an account? Signup"
                : "Already have an account? Login"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 999,
  padding: "15px 18px",
  backgroundColor: "#fff",
  color: "#111",
  fontSize: 16,
};

const primaryBtn: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "16px 22px",
  backgroundColor: "#FFE5D4",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};