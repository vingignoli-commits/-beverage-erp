export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#475569",
          }}
        >
          Sistema operativo
        </p>

        <h1
          style={{
            marginTop: "12px",
            marginBottom: "12px",
            fontSize: "36px",
            lineHeight: 1.1,
          }}
        >
          Beverage ERP
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#334155",
          }}
        >
          La aplicación base está funcionando correctamente en Next.js dentro de
          Codespaces. El siguiente paso es conectar Prisma, Neon y crear el
          primer endpoint de salud del sistema.
        </p>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "12px",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
          }}
        >
          <strong>Estado actual:</strong>
          <ul style={{ marginTop: "12px", marginBottom: 0, paddingLeft: "20px" }}>
            <li>Next.js funcionando</li>
            <li>Puerto 3000 expuesto correctamente</li>
            <li>Base lista para conectar con Neon</li>
          </ul>
        </div>
      </div>
    </main>
  );
}