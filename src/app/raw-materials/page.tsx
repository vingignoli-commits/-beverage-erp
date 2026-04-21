import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function RawMaterialsPage() {
  const materials = await prisma.rawMaterial.findMany({
    where: {
      deletedAt: null,
    },
    include: {
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
          maxWidth: "1100px",
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
              Insumos
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "16px",
              }}
            >
              Maestro de materias primas e insumos productivos.
            </p>
          </div>

          <Link href="/raw-materials/new" style={buttonStyle}>
            Nuevo insumo
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
                <th style={thStyle}>Unidad</th>
                <th style={thStyle}>Costo por unidad</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Activo</th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No hay insumos cargados todavía.
                  </td>
                </tr>
              ) : (
                materials.map((material) => (
                  <tr key={material.id}>
                    <td style={tdStyle}>{material.code}</td>
                    <td style={tdStyle}>{material.name}</td>
                    <td style={tdStyle}>{material.unit}</td>
                    <td style={tdStyle}>{material.costPerUnit}</td>
                    <td style={tdStyle}>
                      {material.supplier?.legalName ?? "-"}
                    </td>
                    <td style={tdStyle}>{material.isActive ? "Sí" : "No"}</td>
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