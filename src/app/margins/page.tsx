import { prisma } from "@/lib/db";

export default async function MarginsPage() {
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const confirmedOrders = await prisma.salesOrder.findMany({
    where: {
      status: "CONFIRMED",
    },
    include: {
      items: true,
    },
  });

  const productionOrders = await prisma.productionOrder.findMany({
    where: {
      status: "EXECUTED",
      executedAt: {
        not: null,
      },
    },
    select: {
      id: true,
      productId: true,
      quantityToProduce: true,
      totalCost: true,
      unitCost: true,
      executedAt: true,
    },
  });

  const revenueByProduct: Record<string, number> = {};
  const soldQtyByProduct: Record<string, number> = {};

  confirmedOrders.forEach((order) => {
    order.items.forEach((item) => {
      revenueByProduct[item.productId] =
        (revenueByProduct[item.productId] || 0) + item.lineTotal;

      soldQtyByProduct[item.productId] =
        (soldQtyByProduct[item.productId] || 0) + item.quantity;
    });
  });

  const costByProduct: Record<string, number> = {};
  const producedQtyByProduct: Record<string, number> = {};

  productionOrders.forEach((order) => {
    const qty = order.quantityToProduce || 0;
    const totalCost = order.totalCost || 0;

    costByProduct[order.productId] =
      (costByProduct[order.productId] || 0) + totalCost;

    producedQtyByProduct[order.productId] =
      (producedQtyByProduct[order.productId] || 0) + qty;
  });

  const rows = products.map((product) => {
    const revenue = revenueByProduct[product.id] || 0;
    const soldQty = soldQtyByProduct[product.id] || 0;
    const totalProductionCost = costByProduct[product.id] || 0;
    const producedQty = producedQtyByProduct[product.id] || 0;

    const averageRealUnitCost =
      producedQty > 0 ? totalProductionCost / producedQty : 0;

    const estimatedRealCostOfSoldUnits = soldQty * averageRealUnitCost;
    const margin = revenue - estimatedRealCostOfSoldUnits;
    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

    return {
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      soldQty,
      producedQty,
      revenue,
      averageRealUnitCost,
      estimatedRealCostOfSoldUnits,
      margin,
      marginPercent,
    };
  });

  rows.sort((a, b) => b.margin - a.margin);

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={eyebrowStyle}>Control económico</p>
          <h1 style={titleStyle}>Márgenes reales por producto</h1>
          <p style={descriptionStyle}>
            El costo ya no sale de la receta teórica. Sale de órdenes de
            producción ejecutadas y su costo real registrado.
          </p>
        </div>

        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>Vendidas</th>
                <th style={thStyle}>Producidas</th>
                <th style={thStyle}>Ingresos</th>
                <th style={thStyle}>Costo unitario real</th>
                <th style={thStyle}>Costo real vendido</th>
                <th style={thStyle}>Margen</th>
                <th style={thStyle}>Margen %</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={emptyCellStyle}>
                    No hay productos para calcular margen.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.productId}>
                    <td style={tdStyle}>{row.productCode}</td>
                    <td style={tdStyle}>{row.name}</td>
                    <td style={tdStyle}>{row.soldQty.toFixed(2)}</td>
                    <td style={tdStyle}>{row.producedQty.toFixed(2)}</td>
                    <td style={tdStyle}>{row.revenue.toFixed(2)}</td>
                    <td style={tdStyle}>{row.averageRealUnitCost.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {row.estimatedRealCostOfSoldUnits.toFixed(2)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        color: row.margin < 0 ? "#b91c1c" : "#166534",
                        fontWeight: 700,
                      }}
                    >
                      {row.margin.toFixed(2)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        color: row.marginPercent < 0 ? "#b91c1c" : "#166534",
                        fontWeight: 700,
                      }}
                    >
                      {row.marginPercent.toFixed(2)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={noteBoxStyle}>
          <strong>Cómo se calcula ahora:</strong>
          <p style={noteTextStyle}>
            Ingresos reales por ventas confirmadas menos costo real estimado de
            las unidades vendidas usando el costo unitario promedio de las
            órdenes de producción ejecutadas.
          </p>
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
  maxWidth: "1400px",
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "24px",
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
  marginBottom: "8px",
  fontSize: "36px",
  lineHeight: 1.1,
};

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "16px",
  lineHeight: 1.6,
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
  whiteSpace: "nowrap",
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

const noteBoxStyle: React.CSSProperties = {
  marginTop: "20px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "20px",
};

const noteTextStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: 0,
  color: "#475569",
  lineHeight: 1.6,
};