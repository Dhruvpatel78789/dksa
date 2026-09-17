export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7EFE7",
        padding: "clamp(88px, 14vw, 120px) clamp(22px, 5vw, 56px) 0",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* Title skeleton */}
        <div
          style={{
            width: "60%",
            height: 80,
            borderRadius: 16,
            background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            margin: "0 auto 34px",
          }}
        />

        {/* Product grid skeleton */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 32,
                padding: 16,
                height: 450,
                boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  height: 285,
                  borderRadius: 26,
                  background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
              <div style={{ padding: "16px 6px" }}>
                <div
                  style={{
                    width: "40%",
                    height: 14,
                    borderRadius: 8,
                    background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    marginBottom: 12,
                  }}
                />
                <div
                  style={{
                    width: "80%",
                    height: 24,
                    borderRadius: 8,
                    background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    marginBottom: 12,
                  }}
                />
                <div
                  style={{
                    width: "60%",
                    height: 14,
                    borderRadius: 8,
                    background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </div>
            </div>
          ))}
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
