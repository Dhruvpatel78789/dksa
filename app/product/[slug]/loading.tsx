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
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}
        >
          <div
            style={{
              height: 500,
              borderRadius: 32,
              background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
          <div>
            <div
              style={{
                width: "60%",
                height: 36,
                borderRadius: 12,
                background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                marginBottom: 16,
              }}
            />
            <div
              style={{
                width: "30%",
                height: 28,
                borderRadius: 12,
                background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                marginBottom: 24,
              }}
            />
            <div
              style={{
                width: "100%",
                height: 100,
                borderRadius: 12,
                background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
                marginBottom: 24,
              }}
            />
            <div
              style={{
                width: "50%",
                height: 50,
                borderRadius: 999,
                background: "linear-gradient(90deg, #3A5A40 25%, #4A6A50 50%, #3A5A40 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />
          </div>
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
