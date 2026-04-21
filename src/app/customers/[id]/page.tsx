async function getCustomer(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

  const response = await fetch(`${baseUrl}/api/customers/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el cliente");
  }

  return response.json();
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getCustomer(id);
  const customer = result.data;

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <p style={eyebrowStyle}>Ficha de cliente</p>
        <h1 style={titleStyle}>{customer.legalName}</h1>

        <div style={cardStyle}>
          <table style={tableStyle}>
            <tbody>
              <Row label="Código" value={customer.customerCode} />
              <Row label="Razón social" value={customer.legalName} />
              <Row label="Nombre comercial" value={customer.tradeName} />
              <Row label="CUIT/DNI" value={customer.taxId} />
              <Row label="Condición fiscal" value={customer.taxCondition} />
              <Row label="Email" value={customer.email} />
              <Row label="Teléfono" value={customer.phone} />
              <Row label="WhatsApp" value={customer.whatsappPhone} />
              <Row label="Dirección" value={customer.addressLine} />
              <Row label="Ciudad" value={customer.city} />
              <Row label="Provincia" value={customer.province} />
              <Row label="País" value={customer.country} />
              <Row label="Código postal" value={customer.postalCode} />
              <Row label="Límite de crédito" value={customer.creditLimit} />
              <Row label="Días de pago" value={customer.paymentTermsDays} />
              <Row label="Estado" value={customer.status} />
              <Row label="Notas" value={customer.notes} />
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | number | null }) {
  return (
    <tr>
      <td style={labelCellStyle}>{label}</td>
      <td style={valueCellStyle}>{value ?? "-"}</td>
    </tr>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "32px",
  fontFamily: "Arial, sans-serif",
  color: "#0f172a",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#475569",
};

const titleStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: "24px",
  fontSize: "36px",
  lineHeight: 1.1,
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const labelCellStyle: React.CSSProperties = {
  width: "240px",
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
  background: "#f8fafc",
  fontWeight: 700,
};

const valueCellStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
};