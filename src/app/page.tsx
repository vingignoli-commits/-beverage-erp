import Link from "next/link";

export default function HomePage() {
  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <p style={eyebrowStyle}>Panel base</p>
        <h1 style={titleStyle}>Beverage ERP</h1>
        <p style={descriptionStyle}>
          La base técnica ya está funcionando. Hay conexión a Neon, Prisma responde,
          y los módulos iniciales de clientes y proveedores ya existen.
        </p>

        <div style={cardsGridStyle}>
          <Card
            title="Clientes"
            description="Alta, listado, detalle, edición y baja lógica del maestro de clientes."
            href="/customers"
          />
          <Card
            title="Proveedores"
            description="Alta, listado, detalle, edición y baja lógica del maestro de proveedores."
            href="/suppliers"
          />
          <Card
            title="Health API"
            description="Chequeo de estado técnico del sistema y conexión con base de datos."
            href="/api/health"
          />
        </div>

        <div style={statusBoxStyle}>
          <strong>Estado actual del proyecto:</strong>
          <ul style={listStyle}>
            <li>Next.js operativo</li>
            <li>Neon conectado</li>
            <li>Prisma operativo</li>
            <li>Customers funcional</li>
            <li>Suppliers funcional</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} style={cardStyle}>
      <h2 style={cardTitleStyle}>{title}</h2>
      <p style={cardDescriptionStyle}>{description}</p>
    </Link>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100%",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
};

const titleStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: "12px",
  fontSize: "42px",
  lineHeight: 1.05,
};

const descriptionStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "28px",
  fontSize: "16px",
  lineHeight: 1.6,
  color: "#475569",
  maxWidth: "760px",
};

const cardsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "16px",
};

const cardStyle: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  color: "#0f172a",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const cardTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "10px",
  fontSize: "22px",
};

const cardDescriptionStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "14px",
  lineHeight: 1.6,
  color: "#475569",
};

const statusBoxStyle: React.CSSProperties = {
  marginTop: "24px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "20px",
};

const listStyle: React.CSSProperties = {
  marginTop: "12px",
  marginBottom: 0,
  paddingLeft: "20px",
  color: "#475569",
};