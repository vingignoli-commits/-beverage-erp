import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  // ------------------------
  // BÁSICO
  // ------------------------

  const [income, expense, receivable, payable] = await Promise.all([
    prisma.financialEntry.aggregate({
      where: { type: "INCOME", status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.financialEntry.aggregate({
      where: { type: "EXPENSE", status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.financialEntry.aggregate({
      where: { type: "INCOME", status: "PENDING" },
      _sum: { amount: true },
    }),
    prisma.financialEntry.aggregate({
      where: { type: "EXPENSE", status: "PENDING" },
      _sum: { amount: true },
    }),
  ]);

  const sales = await prisma.salesOrder.aggregate({
    where: { status: "CONFIRMED" },
    _sum: { totalAmount: true },
    _count: true,
  });

  // ------------------------
  // AVANZADO
  // ------------------------

  const stockMovements = await prisma.stockMovement.findMany({
    where: { entityType: "RAW_MATERIAL" },
  });

  let stockValue = 0;

  stockMovements.forEach((m) => {
    const sign = m.movementType === "IN" ? 1 : -1;
    stockValue += sign * m.quantity * (m.unitCost || 0);
  });

  const upcoming = await prisma.financialEntry.findMany({
    where: {
      status: "PENDING",
      dueDate: {
        gte: new Date(),
      },
    },
  });

  let projected = 0;

  upcoming.forEach((e) => {
    if (e.type === "INCOME") projected += e.amount;
    if (e.type === "EXPENSE") projected -= e.amount;
  });

  // ------------------------
  // UI
  // ------------------------

  return (
    <main style={main}>
      <div style={container}>
        <h1 style={title}>Dashboard Ejecutivo</h1>

        <Section title="Finanzas">
          <Card title="Ingresos" value={income._sum.amount} />
          <Card title="Egresos" value={expense._sum.amount} />
          <Card title="Por cobrar" value={receivable._sum.amount} />
          <Card title="Por pagar" value={payable._sum.amount} />
        </Section>

        <Section title="Operación">
          <Card title="Ventas" value={sales._sum.totalAmount} />
          <Card title="Pedidos" value={sales._count} />
          <Card title="Stock valorizado" value={stockValue} />
          <Card title="Flujo proyectado" value={projected} />
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: any) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 12 }}>{title}</h2>
      <div style={grid}>{children}</div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div style={card}>
      <p style={{ color: "#64748b" }}>{title}</p>
      <h2>{value ? value.toFixed(2) : "0"}</h2>
    </div>
  );
}

const main = {
  padding: 32,
  background: "#f8fafc",
  minHeight: "100vh",
};

const container = {
  maxWidth: 1200,
  margin: "0 auto",
};

const title = {
  fontSize: 32,
  marginBottom: 24,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 16,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};