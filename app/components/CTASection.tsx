import Link from "next/link";

export default function CTASection() {
  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundColor: "#3A5A40",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div>
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: "clamp(48px, 9vw, 120px)",
            lineHeight: 0.9,
            letterSpacing: "-0.08em",
          }}
        >
          Ready for better hair days?
        </h2>

        <p
          style={{
            maxWidth: "680px",
            margin: "0 auto 32px",
            fontSize: "clamp(18px, 2vw, 26px)",
            lineHeight: 1.5,
            opacity: 0.9,
          }}
        >
          Start with the right foundation and build a routine that actually
          fits your concern.
        </p>

        <Link href="/shop" style={{ textDecoration: "none" }}>
          <button
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "16px 28px",
              backgroundColor: "#FFE5D4",
              color: "#2F3E2F",
              fontWeight: 900,
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Build My Routine
          </button>
        </Link>
      </div>
    </section>
  );
}
