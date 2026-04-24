import { prisma } from "@/lib/db";

const TARGET_MARGIN_PERCENT = 60;

export default async function PricingPage() {
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    orderBy: {
      name: "asc",
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
      productId: true,
      quantityToProduce: true,
      totalCost: true,
    },
  });

  const salesOrders = await prisma.salesOrder.findMany({
    where: {
      status: "CONFIRMED",
    },
    include: {
      items: true,
    },
  });

  const producedQtyByProduct: Record<string, number> = {};
  const productionCostByProduct: Record<string, number> = {};

  productionOrders.forEach((order) => {
    producedQtyByProduct[order.productId] =
      (producedQtyByProduct[order.productId] || 0) + order.quantityToProduce;

    productionCostByProduct[order.productId] =
      (productionCostByProduct[order.productId] || 0) + (order.totalCost || 0);
  });

  const soldQtyByProduct: Record<string, number> = {};
  const revenueByProduct: Record<string, number> = {};

  salesOrders.forEach((order) => {
    order.items.forEach((item) => {
      soldQtyByProduct[item.productId] =
        (soldQtyByProduct[item.productId] || 0) + item.quantity;

      revenueByProduct[item.productId] =
        (revenueByProduct[item.productId] || 0) + item.lineTotal;
    });
  });

  const rows = products.map((product) => {
    const producedQty = producedQtyByProduct[product.id] || 0;
    const productionCost = productionCostByProduct[product.id] || 0;

    const averageRealCost =
      producedQty > 0 ? productionCost / producedQty : 0;

    const soldQty = soldQtyByProduct[product.id] || 0;
    const revenue = revenueByProduct[product.id] || 0;

    const averageSellingPrice = soldQty > 0 ? revenue / soldQty : 0;

    const suggestedMinimumPrice =
      averageRealCost > 0
        ? averageRealCost / (1 - TARGET_MARGIN_PERCENT / 100)
        : 0;

    const currentMargin =
      averageSellingPrice > 0
        ? ((averageSellingPrice - averageRealCost) / averageSellingPrice) * 100
        : 0;

    const priceGap = averageSellingPrice - suggestedMinimumPrice;

    return {
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      averageRealCost,
      averageSellingPrice,
      suggestedMinimumPrice,
      currentMargin,
      priceGap,
      status:
        averageRealCost === 0
          ? "SIN_COSTO"
          : averageSellingPrice === 0
            ? "SIN_VENTAS"
            : averageSellingPrice >= suggestedMinimumPrice
              ? "OK"
              : "REVISAR",
    };
  });

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={eyebrowStyle}>Control económico</p>
          <h1 style={titleStyle}>Pricing automático</h1>
          <p style={descriptionStyle}>
            Precio mínimo sugerido según costo real promedio y margen objetivo
            del {TARGET_MARGIN_PERCENT}%.
          </p>
        </div>

        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>Costo real promedio</th>
                <th style={thStyle}>Precio promedio vendido</th>
                <th style={thStyle}>Precio mínimo sugerido</th>
                <th style={thStyle}>Margen actual</th>
                <th style={thStyle}>Brecha</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={emptyCellStyle}>
                    No hay productos para calcular pricing.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td style={tdStyle}>{row.productCode}</td>
                    <td style={tdStyle}>{row.name}</td>
                    <td style={tdStyle}>{row.averageRealCost.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {row.averageSellingPrice.toFixed(2)}
                    </td>
                    <td style={tdStyle}>
                      {row.suggestedMinimumPrice.toFixed(2)}
                    </td>
                    <td style={tdStyle}>{row.currentMargin.toFixed(2)}%</td>
                    <td
                      style={{
                        ...tdStyle,
                        color: row.priceGap < 0 ? "#b91c1c" : "#166534",
                        fontWeight: 700,
                      }}
                    >
                      {row.priceGap.toFixed(2)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: 700,
                        color:
                          row.status === "OK"
                            ? "#166534"
                            : row.status === "REVISAR"
                              ? "#b91c1c"
                              : "#92400e",
                      }}
                    >
                      {row.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={noteBoxStyle}>
          <strong>Lectura:</strong>
          <p style={noteTextStyle}>
            Si el estado es REVISAR, el precio promedio vendido no cubre el
            margen objetivo. Si aparece SIN_COSTO, falta ejecutar producción
            con costo real. Si aparece SIN_VENTAS, todavía no hay precio
            histórico para comparar.
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