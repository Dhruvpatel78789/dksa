import { Metadata } from "next";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Returns & Refund Policy | Shashwat Ayurvedam",
  description: "Learn about Returns, Replacements, and Refund Policy at Shashwat Ayurvedam. We ensure high quality and customer satisfaction.",
  alternates: {
    canonical: "https://shashwatayurvedam.com/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <main style={{ backgroundColor: "#F7EFE7", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <FloatingActions />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, marginBottom: "24px", letterSpacing: "-0.05em" }}>
          Returns & Refund Policy
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "40px" }}>Last updated: September 2026</p>

        <section style={{ display: "grid", gap: "28px", lineHeight: 1.7, fontSize: "16px", color: "#333" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>1. Overview</h2>
            <p>
              Thank you for shopping at Shashwat Ayurvedam. We take immense pride in the authentic quality of our Ayurvedic products.
              If you are not entirely satisfied with your purchase, we are here to help.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>2. Return Eligibility</h2>
            <p>
              To be eligible for a return or exchange:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li>Your item must be unused, sealed, and in the same condition that you received it.</li>
              <li>The item must be in its original packaging with all security seals intact.</li>
              <li>Returns must be requested within 7 days from the date of order delivery.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>3. Damaged or Defective Items</h2>
            <p>
              If you receive a damaged, spilled, or defective product, please notify us immediately within 48 hours of delivery along with photos or unboxing video at (+91) 84870 79480. We will dispatch a replacement product free of cost.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "10px" }}>4. Refund Process</h2>
            <p>
              Once your return is received and inspected, we will send you an email/SMS notification regarding the approval or rejection of your refund.
              Approved refunds will be processed to your original method of payment within 5-7 business days.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
