import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
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
              Módulo base
            </p>
            <h1
              style={{
                marginTop: "8px",
                marginBottom: "8px",
                fontSize: "36px",
                lineHeight: 1.1,
              }}
            >
              Productos
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "16px",
              }}
            >
              Maestro de productos finales e intermedios.
            </p>
          </div>

          <Link href="/products/new" style={buttonStyle}>
            Nuevo producto
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
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Unidad</th>
                <th style={thStyle}>Volumen (ml)</th>
                <th style={thStyle}>Alcohol %</th>
                <th style={thStyle}>Activo</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No hay productos cargados todavía.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td style={tdStyle}>{product.productCode}</td>
                    <td style={tdStyle}>{product.name}</td>
                    <td style={tdStyle}>{product.type}</td>
                    <td style={tdStyle}>{product.unit}</td>
                    <td style={tdStyle}>{product.volumeMl ?? "-"}</td>
                    <td style={tdStyle}>
                      {product.alcoholPercent !== null &&
                      product.alcoholPercent !== undefined
                        ? product.alcoholPercent
                        : "-"}
                    </td>
                    <td style={tdStyle}>{product.isActive ? "Sí" : "No"}</td>
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