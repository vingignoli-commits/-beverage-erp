import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      product: true,
      items: {
        include: {
          rawMaterial: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const data = recipes.map((recipe) => {
    const theoreticalCost = recipe.items.reduce((acc, item) => {
      return acc + item.quantity * item.rawMaterial.costPerUnit;
    }, 0);

    return {
      ...recipe,
      theoreticalCost,
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
              Núcleo productivo
            </p>
            <h1
              style={{
                marginTop: "8px",
                marginBottom: "8px",
                fontSize: "36px",
                lineHeight: 1.1,
              }}
            >
              Recetas
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "16px",
              }}
            >
              Fórmulas de producto e insumos asociados.
            </p>
          </div>

          <Link href="/recipes/new" style={buttonStyle}>
            Nueva receta
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
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>Ítems</th>
                <th style={thStyle}>Costo teórico</th>
                <th style={thStyle}>Activa</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No hay recetas cargadas todavía.
                  </td>
                </tr>
              ) : (
                data.map((recipe) => (
                  <tr key={recipe.id}>
                    <td style={tdStyle}>{recipe.code}</td>
                    <td style={tdStyle}>{recipe.name}</td>
                    <td style={tdStyle}>{recipe.product.name}</td>
                    <td style={tdStyle}>{recipe.items.length}</td>
                    <td style={tdStyle}>{recipe.theoreticalCost.toFixed(2)}</td>
                    <td style={tdStyle}>{recipe.isActive ? "Sí" : "No"}</td>
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