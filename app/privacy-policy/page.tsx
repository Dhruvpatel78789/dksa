import { Metadata } from "next";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Shashwat Ayurvedam",
  description: "Read the Privacy Policy of Shashwat Ayurvedam. Learn about our standards for secure transactions and customer information privacy.",
  alternates: {
    canonical: "https://shashwatayurvedam.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ backgroundColor: "#F7EFE7", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <FloatingActions />
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "120px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, marginBottom: "24px", letterSpacing: "-0.05em" }}>
          Privacy Policy
        </h1>

        <section style={{ display: "grid", gap: "28px", lineHeight: 1.7, fontSize: "16px", color: "#333" }}>
          <p>
            At Shashwat Ayurvedam, we value the trust you place in us. That’s why we insist upon the highest standards for secure transactions and customer information privacy. Please read the following statement to learn about our information gathering and dissemination practices.
          </p>

          <div style={{ backgroundColor: "#FFF", padding: "20px 24px", borderRadius: "20px", borderLeft: "4px solid #3A5A40" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 900, color: "#2F3E2F" }}>PLEASE NOTE</h3>
            <p style={{ margin: 0, fontSize: "15px", color: "#555" }}>
              Our Privacy Policy is subject to change at any point in time without notice. To make sure you are aware of any changes, please review this policy document periodically. By visiting this Website you agree to be bound by the terms and conditions of this Privacy Policy. If you do not agree, please do not use or access our Website.
            </p>
          </div>

          <p>
            By mere use of the Website, you expressly consent to our use and disclosure of your personal information in accordance with this Privacy Policy. This Privacy Policy is incorporated into and subject to the Terms of Use.
          </p>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              1. Collection of Personally Identifiable Information and Other Information
            </h2>
            <p>
              When you use our Website, we collect and store your Personal Information which is provided by you from time to time. Our primary goal in doing so is to provide you a safe, efficient, smooth and customized experience. This allows us to provide Services and Features that most likely meet your needs, and to customize our Website to make your experience safer and easier.
            </p>
            <p style={{ marginTop: "12px" }}>
              In general, you can browse the Website without telling us who you are or revealing any Personal Information about yourself. Once you give us your Personal Information, you are not anonymous to us. Where possible, we indicate which fields are required and which fields are optional. You always have the option to not provide the Information by choosing not to use a particular Service or Feature on the Website. We may automatically track certain Information about you based upon your behaviour on our Website. We use this Information to do internal research on our user’s Demographics, Interests and Behaviour to better understand, protect and serve our users. This Information is compiled and analysed on an aggregated basis. This Information may include the URL that you just came from (whether this URL is on our Website or not), which URL you next go to (whether this URL is on our Website or not), your computer browser information and your IP address.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              2. Use of Demographic/Profile Data/Your Information
            </h2>
            <p>
              We use Personal Information to provide the Services you request. To the extent we use your Personal Information to market to you, we will provide you the ability to opt-out of such uses. In our efforts to continually improve our Product and Service offerings, we collect and analyse Demographic and Profile data about our users’ activity on our Website.
            </p>
            <p style={{ marginTop: "12px" }}>
              We identify and use your IP address to help diagnose problems with our server, and to administer our Website. Your IP address is also used to help identify you and to gather broad Demographic information.
            </p>
            
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#2F3E2F", marginTop: "16px", marginBottom: "8px" }}>
              Cookies
            </h3>
            <p>
              A “Cookie” is a small piece of Information stored by a Web Server on a Web Browser so it can be later read back from that Browser. Cookies are useful for enabling the Browser to remember Information specific to a given user. We place temporary Cookies in your computer’s hard drive. The Cookies do not contain any of your Personally Identifiable Information.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              3. Sharing of Personal Information
            </h2>
            <p>
              We may disclose Personal Information, if required to do so, by Law or in the good faith belief that such disclosure is reasonably necessary to respond to Subpoenas, Court Orders, or other Legal Process/Processes. We may disclose Personal Information to Law Enforcement Offices, third party Rights Owners, or others in the good faith belief that such disclosure is reasonably necessary to enforce our Terms or Privacy Policy.
            </p>
            <p style={{ marginTop: "12px" }}>
              We and our Affiliates will Share/Sell some or all of your Personal Information with another Business Entity should we (or our Assets) plan to merge with, or be acquired by that Business Entity, or in case of a Re-organization, Amalgamation, or Restructuring of Business. Should such a transaction occur, that other Business Entity (or the new Combined Entity) will be required to follow this Privacy Policy with respect to your Personal Information.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              4. Links to Other Sites
            </h2>
            <p>
              Our Website links to other Websites that may collect Personally Identifiable Information about you.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              5. Security Precautions
            </h2>
            <p>
              Our Website has Stringent Security measures as applicable to protect the Loss, Misuse, and Alteration of the Information under our control. Once your Information is in our possession we adhere to Strict Security Guidelines, protecting it against Unauthorized Access.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              6. Your Consent
            </h2>
            <p>
              By using the Website and/or by providing your Information, you consent to the Collection and Use of the Information you disclose on the Website in accordance with this Privacy Policy, including but not limited to your Consent for sharing your Information as per this Privacy Policy.
            </p>
            <p style={{ marginTop: "12px" }}>
              If we decide to change our Privacy Policy, we will post those changes on this Page so that you are always aware of what Information we collect, how we use it, and under what circumstances we disclose it.
            </p>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "24px", marginTop: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#2F3E2F", marginBottom: "12px" }}>
              7. Contact Details
            </h2>
            <p style={{ marginBottom: "8px" }}>
              If you have any questions about this Privacy Statement, the practices of this Website or your dealings with this Website, you can contact:
            </p>
            <strong style={{ display: "block", fontSize: "17px", color: "#111" }}>Shashwat Ayurvedam</strong>
            <p style={{ margin: "4px 0 8px", color: "#555" }}>
              FF1, Palak 2, Above SBI, Anand Nagar – Ramdevnagar Road,<br />
              Satellite, Ahmedabad – 380015
            </p>
            <p style={{ margin: 0, fontWeight: 800, color: "#3A5A40" }}>
              Email: <a href="mailto:mihirayurved79@gmail.com" style={{ color: "#3A5A40", textDecoration: "underline" }}>mihirayurved79@gmail.com</a>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
