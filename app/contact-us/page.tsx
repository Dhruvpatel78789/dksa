import { Metadata } from "next";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Contact Us | Shashwat Ayurvedam Store & Consultation",
  description: "Get in touch with Shashwat Ayurvedam. Visit our Satellite store in Ahmedabad or call (+91) 84870 79480 for consultations.",
  alternates: {
    canonical: "https://shashwatayurvedam.com/contact-us",
  },
};

export default function ContactUsPage() {
  return (
    <main style={{ backgroundColor: "#F7EFE7", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <FloatingActions />
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "120px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", fontWeight: 900, marginBottom: "16px", letterSpacing: "-0.05em" }}>
          Contact Us
        </h1>
        <p style={{ color: "#555", fontSize: "18px", maxWidth: "600px", marginBottom: "48px" }}>
          Have questions about our Ayurvedic treatments or products? Reach out to our expert practitioners or visit our Satellite store in Ahmedabad.
        </p>

        <div style={{ backgroundColor: "#FFFFFF", padding: "36px", borderRadius: "28px", boxShadow: "0 12px 35px rgba(0,0,0,0.06)", maxWidth: "640px" }}>
          <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#2F3E2F", marginBottom: "16px" }}>📍 Satellite Store & Clinic</h3>
          <p style={{ lineHeight: 1.6, color: "#555", fontSize: "16px", margin: "0 0 16px" }}>
            FF1, Palak 2, Above SBI, Anand Nagar – Ramdevnagar Road,<br />
            Satellite, Ahmedabad – 380015, Gujarat
          </p>
          <p style={{ margin: "8px 0", fontWeight: 800, color: "#3A5A40", fontSize: "16px" }}>
            📱 Phone: (+91) 84870 79480
          </p>
          <p style={{ margin: "8px 0", fontWeight: 800, color: "#3A5A40", fontSize: "16px" }}>
            ✉️ Email: <a href="mailto:mihirayurved79@gmail.com" style={{ color: "#3A5A40", textDecoration: "underline" }}>mihirayurved79@gmail.com</a>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
