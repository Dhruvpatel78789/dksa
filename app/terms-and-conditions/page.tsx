import { Metadata } from "next";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Shashwat Ayurvedam",
  description: "Read the Terms & Conditions governing your use of the Shashwat Ayurvedam website and purchase of our Ayurvedic products.",
  alternates: {
    canonical: "https://shashwatayurvedam.com/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main style={{ backgroundColor: "#F7EFE7", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <FloatingActions />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, marginBottom: "24px", letterSpacing: "-0.05em" }}>
          Terms & Conditions
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "40px" }}>Last updated: September 2026</p>

        <section style={{ display: "grid", gap: "28px", lineHeight: 1.7, fontSize: "16px", color: "#333" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>1. Acceptance of Terms</h2>
            <p>
              By accessing and placing an order with Shashwat Ayurvedam, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>2. Medical & Product Disclaimer</h2>
            <p>
              The products and statements on this website are based on traditional Ayurvedic principles. They are not intended to diagnose, treat, cure, or prevent any disease. Always consult your healthcare professional or Ayurvedic practitioner before starting any new treatment routine.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>3. Orders and Pricing</h2>
            <p>
              Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We reserve the right to refuse any order placed with us.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>4. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India, and any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
