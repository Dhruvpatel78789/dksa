export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        fontFamily: "Arial, sans-serif",
        padding: "clamp(88px, 14vw, 120px) clamp(22px, 5vw, 56px) 0",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            width: "50%",
            height: 80,
            borderRadius: 16,
            background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            marginBottom: 34,
          }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28 }}>
          {/* Address form skeleton */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 32,
              padding: 28,
              height: 400,
              boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: 48,
                  borderRadius: 16,
                  background: "linear-gradient(90deg, #F4F4F4 25%, #FAFAFA 50%, #F4F4F4 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  marginBottom: 14,
                }}
              />
            ))}
          </div>

          {/* Summary skeleton */}
          <div
            style={{
              backgroundColor: "#111",
              borderRadius: 36,
              padding: 28,
              height: 380,
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
