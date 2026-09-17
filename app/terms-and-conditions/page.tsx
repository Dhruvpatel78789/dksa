import { Metadata } from "next";
import FloatingActions from "../components/FloatingActions";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions | Shashwat Ayurvedam",
  description: "Read the Terms of Use governing your use of the Shashwat Ayurvedam website and purchase of our Ayurvedic products.",
  alternates: {
    canonical: "https://shashwatayurvedam.com/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main style={{ backgroundColor: "#F7EFE7", minHeight: "100vh", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <FloatingActions />
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "120px 24px 60px" }}>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, marginBottom: "24px", letterSpacing: "-0.05em" }}>
          Terms & Conditions
        </h1>

        <section style={{ display: "grid", gap: "28px", lineHeight: 1.7, fontSize: "16px", color: "#333" }}>
          <p style={{ fontWeight: 800, color: "#2F3E2F", fontSize: "17px" }}>
            PLEASE READ THESE TERMS OF USE AND THE SHASHWAT AYURVEDAM PRIVACY POLICY BEFORE USING THIS WEBSITE OR PURCHASING ANY PRODUCTS OR SERVICES FROM Shashwat Ayurvedam.
          </p>

          <p>
            These Terms of Use are an Agreement (the “Agreement”) between Shashwat Ayurvedam, a Company incorporated under the Laws of India and having its Clinic at FF1, Palak 2, Above SBI, Anand Nagar – Ramdevnagar Road, Satellite, Ahmedabad – 15 (the “Company,” “we” or “us”), and you (“you” or “User”). This Agreement sets forth the Legal terms and conditions governing your use of this and each Web Property (collectively referred to herein as the “Site”) and for your purchase and/or use of any Shashwat Ayurvedam Products, Services (collectively referred to hereinafter as, “Offerings”). Your use of the Site and all Information, Data, Text, Software, Images, Sounds or other Materials contained therein, or your use or purchase of any other Offerings confirms your Unconditional Agreement to be bound by this Agreement and is subject to your continued compliance with the terms and conditions of this Agreement. If you do not agree to be bound by this Agreement, do not access or otherwise use the Site or participate in any of the Offerings. If you are dissatisfied with the Site or other Offerings, your sole and exclusive remedy is to stop using the Site or Offerings, except for the limited warranties that may apply to Shashwat Ayurvedam Product Offerings or as otherwise expressly stated in the Rules of conduct (ROC).
          </p>

          <p>
            This Agreement and the Shashwat Ayurvedam Privacy Policy (the “Privacy Policy”), Rules of Conduct (ROC) and any other terms and policies incorporated herein by reference (collectively, the “Other Policies”), constitute the entire Agreement between you and us pertaining to the subject matter hereof and supersede all prior or other arrangements, understandings, negotiations and discussions, whether oral or written. No waiver of any of the provisions of this Agreement shall constitute a waiver of any other provisions hereof (whether or not similar), nor shall any such waiver constitute a continuing waiver unless otherwise expressly provided. The Information and Features included in this Site are subject to change at any time without notice. By accessing or linking to this Site (to the extent linking is permissible), you assume the risk that the Information on this Site may be changed or removed.
          </p>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              MODIFICATIONS
            </h2>
            <p>We reserve the Right at any time to:</p>
            <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>
              <li>Change the terms and conditions of this Agreement;</li>
              <li>Enhance, add to, modify or discontinue the Site or other Offerings, or any portion of the Site or other Offerings, at any time in our sole discretion.</li>
            </ul>
            <p>
              From time to time, we reserve the Right, in our sole discretion, to modify, update, add to, discontinue, remove, revise or otherwise change any portion of this Agreement, in whole or in part, at any time. For changes to this Agreement that we consider to be Material, we will place a notice on the Site by revising the link on the Homepage to read substantially as “Updated Terms of Use” for a reasonable amount of time. If you provide Information to us, access or use the Site or participate in any Offering in any way after this Agreement has been changed, you will be deemed to have read, understood and unconditionally consented to and agreed to such changes. The most current version of this Agreement will be available on the Site and will supersede all previous versions of this Agreement.
            </p>
            <p style={{ marginTop: "12px" }}>
              The Site or the Offerings, in whole or in part, may be enhanced, modified or discontinued at our sole discretion. Any enhancements, additions or modifications to the Site or Offerings will be subject to this Agreement.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              ACCESS
            </h2>
            <p>
              You must obtain access to the Internet and pay any Service Fees associated with such access to use the Site. In addition, you must provide all equipment necessary for you to access the Internet. You are, and will remain solely responsible for the purchase, hookup, installation, loading, operation and maintenance of any hardware, software, telephone (cable or other) service, and the Internet access service to your Personal Computer and for all related costs. You are solely responsible for scanning your hardware and software for computer viruses and other related problems before you use them. We expressly disclaim any liability or responsibility for any errors or failures relating to the malfunction or failure of your hardware or software in connection with the use of the Site or Offerings.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              ELIGIBILITY
            </h2>
            <p>
              You represent and warrant that you are eighteen (18) years of age or older, or if you are under the age of eighteen (18), you are accessing the Site with the knowledge and consent of your Parent or Legal Guardian, who will also be deemed to have agreed to this Agreement. Certain Features on this Site (including, but not limited to, user registration) and certain Offerings may be subject to heightened age and/or other eligibility requirements. Shashwat Ayurvedam products and the Shashwat Ayurvedam Business Opportunity can be offered, shipped into or sold within India only.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              SHASHWAT AYURVEDAM REFUND GUARANTEE
            </h2>
            <p>
              All Shashwat Ayurvedam Products are covered by Shashwat Ayurvedam Customer Product Refund Policy. If the product is found defective, customer is entitled to return the Products within 7 days from the date of delivery for a Full Refund. The Refund Policy is applicable only for Products in marketable condition, and Unused Products accompanied with an Invoice. This Policy does not apply to Products that have been intentionally Damaged or Misused.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              YOUR INFORMATION AND YOUR PRIVACY
            </h2>
            <p>
              If you provide Information to the Site, you agree to provide accurate, current and complete Information that was requested from you, and you agree to maintain and update such Information as appropriate. We will use and maintain any Information about you that we collect through the Site in accordance with our Privacy Policy.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              OUR PROPRIETARY RIGHTS
            </h2>
            <p>
              This Site and all of the content it contains, or may in the future contain, including but not limited to articles, opinions, other text, directories, guides, photographs, illustrations, images, video and audio clips and advertising copy, as well as the trademarks, copyrights, logos, domain names, code, trade names, service marks, patents and any and all copyrightable material (including source and object code) and/or any other form of intellectual property (collectively, the “Material”) are owned by or licensed to us or other authorized third parties and are protected from unauthorized use, copying and dissemination by copyright, trademark, publicity and other laws and by international treaties. Unless expressly permitted in writing by us, you shall not capture, reproduce, perform, transfer, sell, license, modify, create derivative works from or based upon, republish, reverse engineer, upload, edit, post, transmit, publicly display, frame, link, distribute, or exploit in whole or in part any of the Material. Nothing contained in this Agreement or on the Site should be construed as granting, by implication, estoppel or otherwise, any license or right to use any Material in any manner without the prior written consent of us or such third party that may own the Material or intellectual property displayed on the Site.
            </p>
            <p style={{ marginTop: "12px" }}>
              UNAUTHORIZED USE, COPYING, REPRODUCTION, MODIFICATION, PUBLICATION, REPUBLICATION, UPLOADING, FRAMING, DOWNLOADING, POSTING, TRANSMITTING, DISTRIBUTING, DUPLICATING OR ANY OTHER MISUSE OF ANY OF THE MATERIAL IS STRICTLY PROHIBITED. Any use of the Material other than as permitted by this Agreement will constitute a violation of this Agreement and may constitute copyright and/or patent infringement. You agree not to use the Material for any Unlawful purposes and not to violate our Rights or the Rights of others. You agree not to interfere (or permit the use of your membership by a third party to interfere) with the normal processes or use of the Site by other members, including without limitation by attempting to access administrative areas of the Site. You agree to report any violation of this Agreement by others that you become aware of. You are advised that we will aggressively enforce our rights to the fullest extent of the Law. We may add, change, discontinue, remove or suspend any of the Material at any time, without notice and without liability. Shashwat Ayurvedam, our logo, and the name of the Products produced, marketed, sold or distributed by Shashwat Ayurvedam, are trademarks and/or service marks of Shashwat Ayurvedam or its affiliates. All other trademarks, service marks, and logos used on the Site or other Offerings are the trademarks, service marks or logos of their respective owners.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              MEMBERSHIP AND REGISTRATION
            </h2>
            <p>
              Certain areas of the Site may require registration or may otherwise ask you to provide Information to participate in certain Features or to access certain content. The Site practices governing your Personal Information are disclosed in its Privacy Policy. The decision to provide this Information is purely voluntary and optional; however, if you elect not to provide such Information, you may not be able to access certain content or participate in certain Features of the Site.
            </p>
            <p style={{ marginTop: "12px" }}>
              If you register with the Site, you agree to accept responsibility for all activities that occur under your account, email or password, if any, and agree you will not sell, transfer or assign your membership, any membership Rights or any Site issued email address. You are responsible for maintaining the confidentiality of your Password, if any, and for restricting access to your computer so that others may not access the Password protected portion of the Site or your Site issued email account using your name in whole or in part. We may, in our sole discretion, and at any time, with or without notice, terminate your Password and membership, for any reason or no reason at all.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              PROMOTIONS
            </h2>
            <p>
              This Site may contain sweepstakes, contests or other promotions that require you to send Material or Information about yourself. Please note that sweepstakes, contests or promotions offered via the Site may be, and often are, governed by a separate set of rules that, in addition to describing such sweepstakes, contest or promotion, may have eligibility requirements, such as certain age or geographic area restrictions, terms and conditions governing the use of Material you submit, and disclosures about how your Personal Information may be used. It is your responsibility to read such rules to determine whether or not you want to and are eligible to participate, register and/or enter. By entering any such sweepstakes, contest or other promotion, you agree to comply with or abide by such rules and the decisions of the sponsor(s), which shall be final and binding in all respects.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              LINKS
            </h2>
            <p>
              We may provide links to third party Websites or resources. Our provision of such links is not an endorsement of any Information, Product or Service reached through such link. We are not responsible for the content or performance of any portion of the Internet including other World Wide Websites to which the Site may be linked to, from which the Site may be accessed. You are requested to inform us of any errors or inappropriate material found on Websites to which this Site is or may be linked.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              DISCLAIMER OF WARRANTIES AND LIMITATION OF LIABILITY
            </h2>
            <p>
              This site is provided by Shashwat Ayurvedam on an “as is” and “as available” basis. Shashwat Ayurvedam makes no representations or warranties of any kind, express or implied, as to the operation of this site or the Information, Content, Materials or Products included on this site. You expressly agree that your use of this Site is at your sole risk.
            </p>
            <p style={{ marginTop: "12px" }}>
              To the full extent permissible by Law, Shashwat Ayurvedam disclaims all warranties, express or implied, including, but not limited to, implied warranties of merchantability and fitness for a particular purpose. Shashwat Ayurvedam does not warrant that this site, it’s servers or email sent from Shashwat Ayurvedam are free of viruses or other harmful components. Shashwat Ayurvedam will not be liable for any damages of any kind arising from the use of this Site, including, but not limited to direct, indirect, incidental, punitive and consequential damages.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              LIMITATION OF REMEDY
            </h2>
            <p>
              If you are damaged or injured by any of the Material contained in the Site, or you are dissatisfied with the Site or Material for any reason, then your sole and exclusive remedy is to discontinue accessing and using the site.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              JURISDICTIONAL ISSUES
            </h2>
            <p>
              This Agreement shall be governed by, construed and enforced solely in accordance with the Laws of India, and the Courts at Ahmedabad shall have exclusive jurisdiction in this regard. This is the entire Agreement between the parties relating to the matters contained herein.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2F3E2F", marginBottom: "12px" }}>
              TERMINATION
            </h2>
            <p>
              This agreement will terminate immediately without notice from us, if in our sole discretion you fail to comply with any term or provision of this Agreement. Upon termination, you must destroy all Materials obtained from this Site and all copies thereof, whether made under the terms of this Agreement or otherwise. In the event of termination, the disclaimers of warranties and limitations of liabilities, damages and remedies set forth in this Agreement shall survive.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
