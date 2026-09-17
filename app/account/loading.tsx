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
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div
          style={{
            width: "50%",
            height: 60,
            borderRadius: 16,
            background: "linear-gradient(90deg, #E8DED2 25%, #F0E6DA 50%, #E8DED2 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            marginBottom: 28,
          }}
        />

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 32,
            padding: 28,
            boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
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

          <div
            style={{
              height: 50,
              borderRadius: 999,
              background: "linear-gradient(90deg, #3A5A40 25%, #4A6A50 50%, #3A5A40 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              marginTop: 20,
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
