import { prisma } from "@/lib/db";

export default async function AccountsPayablePage() {
  const entries = await prisma.financialEntry.findMany({
    where: {
      type: "EXPENSE",
      status: "PENDING",
      supplierId: {
        not: null,
      },
    },
    include: {
      supplier: true,
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <p style={eyebrowStyle}>Control financiero</p>
        <h1 style={titleStyle}>Cuentas por pagar</h1>

        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Concepto</th>
                <th style={thStyle}>Monto</th>
                <th style={thStyle}>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} style={emptyCellStyle}>
                    No hay cuentas por pagar pendientes.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={tdStyle}>{entry.code}</td>
                    <td style={tdStyle}>{entry.supplier?.legalName ?? "-"}</td>
                    <td style={tdStyle}>{entry.concept}</td>
                    <td style={tdStyle}>{entry.amount.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {entry.dueDate
                        ? new Date(entry.dueDate).toLocaleDateString("es-AR")
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
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
  maxWidth: "1200px",
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

const tableWrapperStyle: React.CSSProperties = {
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

const theadStyle: React.CSSProperties = {
  background: "#f1f5f9",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: "14px",
  borderBottom: "1px solid #cbd5e1",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: "14px",
  borderBottom: "1px solid #e2e8f0",
};

const emptyCellStyle: React.CSSProperties = {
  padding: "24px",
  textAlign: "center",
  color: "#64748b",
};