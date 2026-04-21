import Link from "next/link";

async function getSuppliers() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";

  const response = await fetch(`${baseUrl}/api/suppliers`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los proveedores");
  }

  return response.json();
}

export default async function SuppliersPage() {
  const result = await getSuppliers();
  const suppliers = result.data ?? [];

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
          maxWidth: "1000px",
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
              Módulo inicial
            </p>
            <h1
              style={{
                marginTop: "8px",
                marginBottom: "8px",
                fontSize: "36px",
                lineHeight: 1.1,
              }}
            >
              Proveedores
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "16px",
              }}
            >
              Maestro base de proveedores del sistema.
            </p>
          </div>

          <Link href="/suppliers/new" style={buttonStyle}>
            Nuevo proveedor
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
                <th style={thStyle}>Razón social</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Ciudad</th>
                <th style={thStyle}>Provincia</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No hay proveedores cargados todavía.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier: any) => (
                  <tr key={supplier.id}>
                    <td style={tdStyle}>
                      <Link href={`/suppliers/${supplier.id}`} style={linkStyle}>
                        {supplier.supplierCode}
                      </Link>
                    </td>
                    <td style={tdStyle}>{supplier.legalName}</td>
                    <td style={tdStyle}>{supplier.email ?? "-"}</td>
                    <td style={tdStyle}>{supplier.phone ?? "-"}</td>
                    <td style={tdStyle}>{supplier.city ?? "-"}</td>
                    <td style={tdStyle}>{supplier.province ?? "-"}</td>
                    <td style={tdStyle}>{supplier.status}</td>
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

const linkStyle: React.CSSProperties = {
  color: "#0f172a",
  fontWeight: 700,
  textDecoration: "none",
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