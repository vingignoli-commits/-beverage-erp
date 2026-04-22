import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function StockPage() {
  const rawMaterials = await prisma.rawMaterial.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: "asc",
    },
  });

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      name: "asc",
    },
  });

  const movements = await prisma.stockMovement.findMany({
    include: {
      rawMaterial: true,
      product: true,
    },
  });

  const rawMaterialRows = rawMaterials.map((material) => {
    const relatedMovements = movements.filter(
      (movement) =>
        movement.entityType === "RAW_MATERIAL" &&
        movement.rawMaterialId === material.id
    );

    const stock = relatedMovements.reduce((acc, movement) => {
      if (movement.movementType === "IN") return acc + movement.quantity;
      if (movement.movementType === "OUT") return acc - movement.quantity;
      return acc + movement.quantity;
    }, 0);

    return {
      id: material.id,
      code: material.code,
      name: material.name,
      unit: material.unit,
      stock,
    };
  });

  const productRows = products.map((product) => {
    const relatedMovements = movements.filter(
      (movement) =>
        movement.entityType === "PRODUCT" &&
        movement.productId === product.id
    );

    const stock = relatedMovements.reduce((acc, movement) => {
      if (movement.movementType === "IN") return acc + movement.quantity;
      if (movement.movementType === "OUT") return acc - movement.quantity;
      return acc + movement.quantity;
    }, 0);

    return {
      id: product.id,
      code: product.productCode,
      name: product.name,
      unit: product.unit,
      stock,
    };
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
              Núcleo operativo
            </p>
            <h1
              style={{
                marginTop: "8px",
                marginBottom: "8px",
                fontSize: "36px",
                lineHeight: 1.1,
              }}
            >
              Stock
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "16px",
              }}
            >
              Saldos derivados a partir de movimientos de stock.
            </p>
          </div>

          <Link href="/stock/new-movement" style={buttonStyle}>
            Nuevo movimiento
          </Link>
        </div>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Insumos</h2>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Unidad</th>
                  <th style={thStyle}>Stock actual</th>
                </tr>
              </thead>
              <tbody>
                {rawMaterialRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={emptyCellStyle}>
                      No hay insumos cargados.
                    </td>
                  </tr>
                ) : (
                  rawMaterialRows.map((row) => (
                    <tr key={row.id}>
                      <td style={tdStyle}>{row.code}</td>
                      <td style={tdStyle}>{row.name}</td>
                      <td style={tdStyle}>{row.unit}</td>
                      <td style={tdStyle}>{row.stock}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Productos</h2>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Unidad</th>
                  <th style={thStyle}>Stock actual</th>
                </tr>
              </thead>
              <tbody>
                {productRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={emptyCellStyle}>
                      No hay productos cargados.
                    </td>
                  </tr>
                ) : (
                  productRows.map((row) => (
                    <tr key={row.id}>
                      <td style={tdStyle}>{row.code}</td>
                      <td style={tdStyle}>{row.name}</td>
                      <td style={tdStyle}>{row.unit}</td>
                      <td style={tdStyle}>{row.stock}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
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

const sectionStyle: React.CSSProperties = {
  marginTop: "24px",
};

const sectionTitleStyle: React.CSSProperties = {
  marginBottom: "12px",
  fontSize: "24px",
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