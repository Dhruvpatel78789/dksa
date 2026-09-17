import { Metadata } from "next";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Return & Cancellation Policy | Shashwat Ayurvedam",
  description: "Learn about the Return Policy and Cancellation Policy at Shashwat Ayurvedam.",
  alternates: {
    canonical: "https://shashwatayurvedam.com/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <main style={{ backgroundColor: "#F7EFE7", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <FloatingActions />
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "120px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, marginBottom: "24px", letterSpacing: "-0.05em" }}>
          Return & Cancellation Policy
        </h1>

        <section style={{ display: "grid", gap: "32px", lineHeight: 1.7, fontSize: "16px", color: "#333" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#2F3E2F", marginBottom: "12px" }}>
              Return Policy
            </h2>
            <p>
              At Shashwat Ayurvedam, we are determined to provide you a hassle free and enjoyable shopping experience. As Ayurvedic products are nature derived, we request you to be patient and give at least 1-2 months time for the products to give you the desired effects.
            </p>
            <p style={{ marginTop: "12px" }}>
              We do not offer reverse pick-up: we will simply send a replacement. In the unlikely event that you receive damaged or defective items, all you have to do is contact our customer care number or email us at{" "}
              <a href="mailto:mihirayurved79@gmail.com" style={{ color: "#3A5A40", fontWeight: 800, textDecoration: "underline" }}>
                mihirayurved79@gmail.com
              </a>.
            </p>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", padding: "28px", borderRadius: "24px", boxShadow: "0 8px 25px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#2F3E2F", marginBottom: "12px" }}>
              Cancellation Policy
            </h2>
            <p>
              Customers will have an option to cancel their orders through the dashboard when they login into their profile.
            </p>
            <p style={{ marginTop: "12px" }}>
              Customer needs to initiate the order Cancellation within the next business day after the Payment. In case the order has already been shipped, they need to approach the customer care through email directly at{" "}
              <a href="mailto:mihirayurved79@gmail.com" style={{ color: "#3A5A40", fontWeight: 800, textDecoration: "underline" }}>
                mihirayurved79@gmail.com
              </a>{" "}
              and get the order cancelled with Refund.
            </p>
            <p style={{ marginTop: "12px", fontWeight: 700, color: "#2F3E2F" }}>
              Note: Product should not be opened/used and should be in a Marketable Condition.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
