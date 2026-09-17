"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

const footerHeadingStyle: React.CSSProperties = {
  margin: "0 0 24px",
  color: "#333333",
  fontSize: "20px",
  fontWeight: 900,
  letterSpacing: "0.02em",
};

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#FFFFFF",
        padding: "64px 24px",
        color: "#7A7A7A",
        fontFamily: "Arial, sans-serif",
        borderTop: "1px solid #EFEFEF",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "48px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Shashwat Ayurvedam Logo"
              width={90}
              height={90}
              style={{
                width: "90px",
                height: "auto",
                marginBottom: "24px",
              }}
            />
          </Link>

          <p style={{ fontSize: "16px", lineHeight: 1.6, marginBottom: "20px" }}>
            Be yourself, follow your heart! In yogic sense, the phrase “be yourself
            – follow your heart” has a deeper meaning. Live healthy with Ayurveda.
          </p>

          <p style={{ fontSize: "15px", lineHeight: 1.5, margin: "6px 0" }}>
            📍 FF1, Palak 2, Above SBI, Anand Nagar – Ramdevnagar Road, Satellite, Ahmedabad – 380015
          </p>

          <p style={{ fontSize: "15px", lineHeight: 1.5, margin: "6px 0" }}>
            📱 Phone: (+91) 84870 79480
          </p>

          <p style={{ fontSize: "15px", lineHeight: 1.5, margin: "6px 0" }}>
            ✉️ Email: mihirayurved79@gmail.com
          </p>
        </div>

        <div>
          <h3 style={footerHeadingStyle}>OUR STORE</h3>
          <p style={{ margin: "0 0 14px", color: "#555555", fontSize: "16px" }}>
            Satellite Branch, Ahmedabad
          </p>
          <p style={{ margin: "0", color: "#777777", fontSize: "14px" }}>
            FF1, Palak 2, Above SBI, Anand Nagar Road
          </p>
        </div>

        <div>
          <h3 style={footerHeadingStyle}>USEFUL LINKS</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
            <li>
              <Link href="/privacy-policy" style={{ color: "#7A7A7A", textDecoration: "none", fontSize: "16px" }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" style={{ color: "#7A7A7A", textDecoration: "none", fontSize: "16px" }}>
                Returns & Refunds
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" style={{ color: "#7A7A7A", textDecoration: "none", fontSize: "16px" }}>
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/contact-us" style={{ color: "#7A7A7A", textDecoration: "none", fontSize: "16px" }}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 style={footerHeadingStyle}>FOOTER MENU</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
            <li>
              <Link href="/shop" style={{ color: "#7A7A7A", textDecoration: "none", fontSize: "16px" }}>
                Shop All Products
              </Link>
            </li>
            <li>
              <Link href="/contact-us" style={{ color: "#7A7A7A", textDecoration: "none", fontSize: "16px" }}>
                Store Location
              </Link>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7A7A7A", textDecoration: "none", fontSize: "16px" }}
              >
                Instagram Profile ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "48px auto 0",
          paddingTop: "24px",
          borderTop: "1px solid #EEEEEE",
          textAlign: "center",
          fontSize: "14px",
          color: "#999999",
        }}
      >
        © 2026 Shashwat Ayurvedam. All rights reserved.
      </div>
    </footer>
  );
}
