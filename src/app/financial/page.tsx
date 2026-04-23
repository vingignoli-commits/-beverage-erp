import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function FinancialPage() {
  const entries = await prisma.financialEntry.findMany({
    include: {
      customer: true,
      supplier: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#475569",
              }}
            >
              Núcleo financiero
            </p>
            <h1
              style={{
                marginTop: "8px",
                marginBottom: "8px",
                fontSize: "36px",
                lineHeight: 1.1,
              }}
            >
              Movimientos financieros
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "16px",
              }}
            >
              Ingresos y egresos operativos.
            </p>
          </div>

          <Link href="/financial/new" style={buttonStyle}>
            Nuevo movimiento
          </Link>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead
              style={{
                background: "#f1f5f9",
              }}
            >
              <tr>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Concepto</th>
                <th style={thStyle}>Monto</th>
                <th style={thStyle}>Cliente / Proveedor</th>
                <th style={thStyle}>Vencimiento</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={emptyCellStyle}>
                    No hay movimientos financieros cargados todavía.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={tdStyle}>{entry.code}</td>
                    <td style={tdStyle}>{entry.type}</td>
                    <td style={tdStyle}>{entry.concept}</td>
                    <td style={tdStyle}>{entry.amount.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {entry.customer?.legalName || entry.supplier?.legalName || "-"}
                    </td>
                    <td style={tdStyle}>
                      {entry.dueDate
                        ? new Date(entry.dueDate).toLocaleDateString("es-AR")
                        : "-"}
                    </td>
                    <td style={tdStyle}>{entry.status}</td>
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

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "42px",
  padding: "0 16px",
  borderRadius: "10px",
  background: "#0f172a",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
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