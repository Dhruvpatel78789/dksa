import { Metadata } from "next";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Shashwat Ayurvedam",
  description: "Read the Privacy Policy of Shashwat Ayurvedam. Learn how we collect, protect, and use your personal information.",
  alternates: {
    canonical: "https://shashwatayurvedam.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ backgroundColor: "#F7EFE7", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <FloatingActions />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, marginBottom: "24px", letterSpacing: "-0.05em" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "40px" }}>Last updated: September 2026</p>

        <section style={{ display: "grid", gap: "28px", lineHeight: 1.7, fontSize: "16px", color: "#333" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>1. Introduction</h2>
            <p>
              At Shashwat Ayurvedam, accessible from shashwatayurvedam.com, one of our main priorities is the privacy of our visitors.
              This Privacy Policy document contains types of information that is collected and recorded by Shashwat Ayurvedam and how we use it.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>2. Information We Collect</h2>
            <p>
              When you register for an account, make a purchase, or contact us, we may collect personal information including your full name,
              email address, phone number, shipping address, and payment information.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>3. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li>Provide, operate, and maintain our website and services</li>
              <li>Process and fulfill your orders, including delivery and payment processing</li>
              <li>Improve, personalize, and expand our product offerings</li>
              <li>Communicate with you for customer support and order updates</li>
              <li>Send you newsletters, marketing, or promotional materials (with your consent)</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>4. Security of Your Data</h2>
            <p>
              The security of your personal data is important to us. We implement industry-standard administrative and technical security measures
              to protect your personal information from unauthorized access, disclosure, or misuse.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>5. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at (+91) 84870 79480 or visit our stores in Ahmedabad.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
