export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        padding: "clamp(24px, 5vw, 56px)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            width: "40%",
            height: 80,
            borderRadius: 16,
            background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            marginBottom: 36,
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 28,
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 32,
                  padding: 18,
                  height: 140,
                  boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
                  background: "linear-gradient(90deg, #fff 25%, #F8F4F0 50%, #fff 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            ))}
          </div>

          <div
            style={{
              backgroundColor: "#111",
              borderRadius: 36,
              padding: 28,
              height: 300,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  );
}
