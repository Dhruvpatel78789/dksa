"use client";

import { useEffect, useMemo, useState } from "react";
import FloatingActions from "../components/FloatingActions";
import { useRouter } from "next/navigation";

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

type Address = {
  _id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isMobileRaw, setIsMobileRaw] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobileRaw(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isMobile = mounted ? isMobileRaw : false;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountAmount: number;
    } | null>(null);
    const [couponMessage, setCouponMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const discountedPrice =
        item.discountedPrice !== undefined
          ? item.discountedPrice
          : item.price - (item.price * (item.discountPercentage || 0)) / 100;

      return sum + discountedPrice * item.quantity;
    }, 0);
  }, [cart]);

  const total = Math.max(0, subtotal - (appliedCoupon?.discountAmount || 0));

  async function loadData() {
    try {
      const cartRes = await fetch("/api/cart", { cache: "no-store" });
      const cartData = await cartRes.json();
      setCart(cartData.items || []);

      const addressRes = await fetch("/api/user/addresses", {
        cache: "no-store",
      });

      const addressData = await addressRes.json();
      const addressList = addressData.addresses || [];

      setAddresses(addressList);

      if (addressList.length > 0) {
        setSelectedAddressId((prev) => prev || addressList[0]._id);
      } else {
        setSelectedAddressId("new");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== "new") {
      const activeAddr = addresses.find((a) => a._id === selectedAddressId);
      if (activeAddr) {
        setForm({
          fullName: activeAddr.fullName || "",
          phone: activeAddr.phone || "",
          line1: activeAddr.line1 || "",
          line2: activeAddr.line2 || "",
          city: activeAddr.city || "",
          state: activeAddr.state || "",
          pincode: activeAddr.pincode || "",
        });
      }
    } else if (selectedAddressId === "new") {
      setForm({
        fullName: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
      });
    }
  }, [selectedAddressId, addresses]);

  async function handleAutoSave(updatedForm: typeof form) {
    if (!updatedForm.fullName.trim() || !updatedForm.phone.trim() || !updatedForm.line1.trim()) {
      return;
    }

    try {
      if (selectedAddressId && selectedAddressId !== "new") {
        const res = await fetch("/api/user/addresses", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedAddressId,
            ...updatedForm,
          }),
        });
        if (res.ok) {
          const addressRes = await fetch("/api/user/addresses", { cache: "no-store" });
          if (addressRes.ok) {
            const addressData = await addressRes.json();
            setAddresses(addressData.addresses || []);
          }
        }
      } else {
        if (!updatedForm.city.trim() || !updatedForm.state.trim() || !updatedForm.pincode.trim()) {
          return;
        }

        const res = await fetch("/api/user/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedForm),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.addressId) {
            const addressRes = await fetch("/api/user/addresses", { cache: "no-store" });
            if (addressRes.ok) {
              const addressData = await addressRes.json();
              setAddresses(addressData.addresses || []);
            }
            setSelectedAddressId(data.addressId);
          }
        }
      }
    } catch (err) {
      console.error("Auto-save address error:", err);
    }
  }

  async function placeOrder() {
  const selectedAddress = addresses.find(
    (address) => address._id === selectedAddressId
  );

  if (!selectedAddress) {
    alert("Select or add an address first.");
    return;
  }

  setPlacingOrder(true);

  try {
    const res = await fetch("/api/payments/payu/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: selectedAddress,
        discountCode: appliedCoupon?.code || "",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to start payment");
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.payuUrl;

    Object.entries(data.payload).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("PAYU CHECKOUT ERROR:", error);
    alert("Failed to start payment");
  } finally {
    setPlacingOrder(false);
  }
}

  async function applyCoupon() {
  setCouponMessage("");

  if (!couponCode.trim()) {
    setCouponMessage("Enter a coupon code.");
    return;
  }

  const res = await fetch("/api/user/discounts/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: couponCode,
      items: cart,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setAppliedCoupon(null);
    setCouponMessage(data.error || "Invalid coupon.");
    return;
  }

  setAppliedCoupon(data.coupon);
  setCouponMessage("Coupon applied.");
}

  if (loading) {
    return (
      <main style={centerStyle}>
        <FloatingActions />
        Loading checkout...
      </main>
    );
  }

  return (
    <main
      className="checkout-main"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        padding: "clamp(88px, 10vw, 120px) clamp(22px, 5vw, 56px) 56px",
        fontFamily: "Arial, sans-serif",
        color: "#111",
        boxSizing: "border-box",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <FloatingActions />

      <section style={{ maxWidth: 1220, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <h1
          style={{
            margin: "0 0 34px",
            fontSize: "clamp(54px, 10vw, 120px)",
            lineHeight: 0.85,
            letterSpacing: "-0.08em",
          }}
        >
          checkout
        </h1>

        <div
          className="checkout-grid"
          style={{
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "grid", gap: 24, width: "100%", boxSizing: "border-box" }}>
            <section style={panelStyle}>
              <p style={kickerStyle}>01/ Address</p>
              <h2 style={sectionTitleStyle}>delivery address</h2>

              {addresses.length > 0 && (
                <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
                  {addresses.map((address) => (
                    <label
                      key={address._id}
                      style={{
                        border:
                          selectedAddressId === address._id
                            ? "2px solid #2F3E2F"
                            : "1px solid #ddd",
                        borderRadius: 22,
                        padding: 16,
                        cursor: "pointer",
                        display: "block",
                        backgroundColor: selectedAddressId === address._id ? "rgba(47, 62, 47, 0.04)" : "#fff",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <input
                        type="radio"
                        name="address-select"
                        checked={selectedAddressId === address._id}
                        onChange={() => setSelectedAddressId(address._id)}
                        style={{ marginRight: 10 }}
                      />

                      <strong>{address.fullName}</strong>
                      <p style={{ margin: "8px 0 0", color: "#555" }}>
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""},{" "}
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p style={{ margin: "6px 0 0", color: "#555" }}>
                        Phone: {address.phone}
                      </p>
                    </label>
                  ))}

                  <label
                    style={{
                      border:
                        selectedAddressId === "new"
                          ? "2px dashed #2F3E2F"
                          : "1px dashed #bbb",
                      borderRadius: 22,
                      padding: 16,
                      cursor: "pointer",
                      display: "block",
                      backgroundColor: selectedAddressId === "new" ? "rgba(47, 62, 47, 0.04)" : "transparent",
                      textAlign: "center",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <input
                      type="radio"
                      name="address-select"
                      checked={selectedAddressId === "new"}
                      onChange={() => setSelectedAddressId("new")}
                      style={{ marginRight: 10 }}
                    />
                    <strong>+ Add a new address</strong>
                  </label>
                </div>
              )}

              <div style={{ display: "grid", gap: 14 }}>
                <input
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  onBlur={() => handleAutoSave(form)}
                  style={inputStyle}
                />

                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onBlur={() => handleAutoSave(form)}
                  style={inputStyle}
                />

                <input
                  placeholder="Address line 1"
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  onBlur={() => handleAutoSave(form)}
                  style={inputStyle}
                />

                <input
                  placeholder="Address line 2 optional"
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  onBlur={() => handleAutoSave(form)}
                  style={inputStyle}
                />

                <div className="address-row">
                  <input
                    placeholder="City"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    onBlur={() => handleAutoSave(form)}
                    style={inputStyle}
                  />

                  <input
                    placeholder="State"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    onBlur={() => handleAutoSave(form)}
                    style={inputStyle}
                  />

                  <input
                    placeholder="Pincode"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({ ...form, pincode: e.target.value })
                    }
                    onBlur={() => handleAutoSave(form)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </section>
          </div>

          <aside style={summaryStyle}>
  <p style={{ margin: 0, opacity: 0.6, fontWeight: 900 }}>
    02/ Summary
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

  <div style={{ display: "grid", gap: 14, marginBottom: 24 }}>
    {cart.map((item) => {
      const discountedPrice =
        item.discountedPrice !== undefined
          ? item.discountedPrice
          : item.price -
            (item.price * (item.discountPercentage || 0)) / 100;

      return (
        <div
          key={`${item.productId}-${item.size}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          <span>
            {item.name} × {item.quantity}
          </span>

          <strong>
            ₹{Math.round(discountedPrice * item.quantity)}
          </strong>
        </div>
      );
    })}
  </div>

  <div style={{ marginBottom: 22 }}>
    <p style={{ margin: "0 0 10px", fontWeight: 900 }}>
      Coupon
    </p>

    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        placeholder="Coupon code"
        style={{
          flex: 1,
          minWidth: 0,
          border: "none",
          borderRadius: 999,
          padding: "12px 14px",
          outline: "none",
        }}
      />

      <button
        onClick={applyCoupon}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "12px 16px",
          backgroundColor: "#FFE5D4",
          color: "#111",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Apply
      </button>
    </div>

    {couponMessage && (
      <p
        style={{
          margin: "10px 0 0",
          color: "#FFE5D4",
          fontSize: 14,
        }}
      >
        {couponMessage}
      </p>
    )}
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 12,
      color: "rgba(255,255,255,0.72)",
    }}
  >
    <span>Subtotal</span>
    <strong>₹{Math.round(subtotal)}</strong>
  </div>

  {appliedCoupon && (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 12,
        color: "#FFE5D4",
      }}
    >
      <span>Coupon ({appliedCoupon.code})</span>
      <strong>-₹{Math.round(appliedCoupon.discountAmount)}</strong>
    </div>
  )}

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: 22,
      marginBottom: 26,
      borderTop: "1px solid rgba(255,255,255,0.18)",
      paddingTop: 16,
    }}
  >
    <span>Total</span>
    <strong>₹{Math.round(total)}</strong>
  </div>

  <button
    onClick={placeOrder}
    disabled={placingOrder || cart.length === 0}
    style={{
      width: "100%",
      border: "none",
      borderRadius: 999,
      padding: "16px 20px",
      backgroundColor: "#FFE5D4",
      color: "#111",
      fontWeight: 900,
      cursor: placingOrder ? "not-allowed" : "pointer",
      opacity: placingOrder || cart.length === 0 ? 0.6 : 1,
    }}
  >
    {placingOrder ? "Placing Order..." : "Place Order"}
  </button>
</aside>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
        }

        .address-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 900px) {
          .checkout-main {
            padding: 88px 12px 56px !important;
          }

          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .address-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </main>
  );
}

const centerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  backgroundColor: "#F7EFE7",
  fontFamily: "Arial, sans-serif",
};

const panelStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 36,
  padding: "clamp(22px, 4vw, 34px)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
  boxSizing: "border-box",
  width: "100%",
  maxWidth: "100%",
};

const kickerStyle: React.CSSProperties = {
  margin: 0,
  color: "#6B705C",
  fontWeight: 900,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "8px 0 24px",
  fontSize: "clamp(36px, 6vw, 64px)",
  lineHeight: 0.9,
  letterSpacing: "-0.07em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #ddd",
  borderRadius: 18,
  padding: "14px 16px",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
};

const darkButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "15px 20px",
  backgroundColor: "#111",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const summaryStyle: React.CSSProperties = {
  backgroundColor: "#111",
  color: "#fff",
  borderRadius: 36,
  padding: 28,
  height: "fit-content",
  position: "sticky",
  top: 24,
  boxSizing: "border-box",
  width: "100%",
  maxWidth: "100%",
};