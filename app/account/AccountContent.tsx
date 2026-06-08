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

export default function AccountContent() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">("login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const isAdminLogin = next === "/admin";
  
  const modeParam = searchParams.get("mode");
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  async function checkAuthAndLoad() {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.user) {
        if (data.user.role === "admin") {
          router.replace("/admin");
          return;
        }

        if (isAdminLogin && data.user.role !== "admin") {
          await fetch("/api/auth/logout", {
            method: "POST",
          });
          setUser(null);
          setOrders([]);
          setCheckingAuth(false);
          return;
        }

        setUser(data.user);
        await loadOrders();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingAuth(false);
    }
  }

  useEffect(() => {
    if (modeParam === "reset" && tokenParam && emailParam) {
      setMode("reset");
      setEmail(emailParam);
      setCheckingAuth(false);
    } else {
      checkAuthAndLoad();
    }
  }, [modeParam, tokenParam, emailParam]);

  async function handleSubmit() {
    try {
      setLoading(true);
      setMessage("");

      if (mode === "forgot") {
        if (!email.trim()) {
          setMessage("Email is required");
          return;
        }

        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (!res.ok) {
          setMessage(data.error || "Failed to send reset link");
          return;
        }

        setMessage(data.message || "Reset link sent successfully");
        setEmail("");
        return;
      }

      if (mode === "reset") {
        if (!password) {
          setMessage("Password is required");
          return;
        }
        if (password !== confirmPassword) {
          setMessage("Passwords do not match");
          return;
        }

        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token: tokenParam,
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setMessage(data.error || "Failed to reset password");
          return;
        }

        setMessage("Password reset successfully. You can now login.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        router.replace("/account");
        return;
      }

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

      const meRes = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const meData = await meRes.json();
      const loggedInUser = meData.user;

      if (isAdminLogin) {
        if (loggedInUser?.role === "admin") {
          setCheckingAuth(true);
          router.replace("/admin");
          return;
        } else {
          setMessage("This login is not an admin account.");
          await fetch("/api/auth/logout", {
            method: "POST",
          });
          setUser(null);
          setOrders([]);
          return;
        }
      }

      if (loggedInUser?.role === "admin") {
        setCheckingAuth(true);
        router.replace("/admin");
        return;
      }

      if (next) {
        setCheckingAuth(true);
        router.replace(next);
        return;
      }

      setUser(loggedInUser);
      await loadOrders();
        
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

  if (checkingAuth) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#F7EFE7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          color: "#111",
        }}
      >
        <FloatingActions />
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", fontWeight: "bold" }}>Loading account...</p>
        </div>
      </main>
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
            : mode === "signup"
            ? "signup"
            : mode === "forgot"
            ? "reset password"
            : "new password"}
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                />
              )}

              {(mode === "signup" || mode === "login" || mode === "forgot") && (
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  style={inputStyle}
                />
              )}

              {(mode === "signup" || mode === "login" || mode === "reset") && (
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "reset" ? "New password" : "Password"}
                    type={showPassword ? "text" : "password"}
                    style={{ ...inputStyle, paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "18px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      opacity: 0.6,
                    }}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {mode === "reset" && (
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    type={showConfirmPassword ? "text" : "password"}
                    style={{ ...inputStyle, paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "18px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      opacity: 0.6,
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setMessage("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#FFE5D4",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "14px",
                    textAlign: "right",
                    padding: 0,
                    marginTop: "-4px",
                  }}
                >
                  Forgot Password?
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={primaryBtn}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Login"
                  : mode === "signup"
                  ? "Create Account"
                  : mode === "forgot"
                  ? "Send Reset Link"
                  : "Reset Password"}
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

            {(mode === "login" || mode === "signup") ? (
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
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {mode === "login"
                  ? "Don't have an account? Signup"
                  : "Already have an account? Login"}
              </button>
            ) : (
              <button
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                style={{
                  marginTop: 24,
                  background: "transparent",
                  border: "none",
                  color: "#FFE5D4",
                  cursor: "pointer",
                  fontWeight: 900,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Back to Login
              </button>
            )}
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