import { Metadata } from "next";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Contact Us | Shashwat Ayurvedam Store & Consultation",
  description: "Get in touch with Shashwat Ayurvedam. Visit our stores in Satellite and Naranpura, Ahmedabad, or call (+91) 84870 79480 for consultations.",
  alternates: {
    canonical: "https://shashwatayurvedam.com/contact-us",
  },
};

export default function ContactUsPage() {
  return (
    <main style={{ backgroundColor: "#F7EFE7", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <FloatingActions />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", fontWeight: 900, marginBottom: "16px", letterSpacing: "-0.05em" }}>
          Contact Us
        </h1>
        <p style={{ color: "#555", fontSize: "18px", maxWidth: "600px", marginBottom: "48px" }}>
          Have questions about our Ayurvedic treatments or products? Reach out to our expert practitioners or visit our stores in Ahmedabad.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginBottom: "60px" }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "32px", borderRadius: "28px", boxShadow: "0 12px 35px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#2F3E2F", marginBottom: "16px" }}>📍 Satellite Store & Clinic</h3>
            <p style={{ lineHeight: 1.6, color: "#555", fontSize: "16px" }}>
              Ayurveda Consultant & Panchkarma Specialist<br />
              Satellite, Ahmedabad, Gujarat - 380015
            </p>
            <p style={{ marginTop: "16px", fontWeight: 800, color: "#3A5A40" }}>
              📱 Phone: (+91) 84870 79480
            </p>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", padding: "32px", borderRadius: "28px", boxShadow: "0 12px 35px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#2F3E2F", marginBottom: "16px" }}>📍 Naranpura Store & Clinic</h3>
            <p style={{ lineHeight: 1.6, color: "#555", fontSize: "16px" }}>
              Ayurveda Consultant & Panchkarma Specialist<br />
              Naranpura, Ahmedabad, Gujarat - 380013
            </p>
            <p style={{ marginTop: "16px", fontWeight: 800, color: "#3A5A40" }}>
              📱 Phone: (+91) 84870 79480
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
