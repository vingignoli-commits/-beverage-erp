import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // ------------------------
    // FINANZAS
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

    // ------------------------
    // VENTAS
    // ------------------------

    const sales = await prisma.salesOrder.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { totalAmount: true },
      _count: true,
    });

    // ------------------------
    // PRODUCCIÓN
    // ------------------------

    const production = await prisma.productionOrder.aggregate({
      where: { status: "EXECUTED" },
      _count: true,
    });

    // ------------------------
    // STOCK PRODUCTOS
    // ------------------------

    const productMovements = await prisma.stockMovement.findMany({
      where: { entityType: "PRODUCT" },
    });

    const stockByProduct: Record<string, number> = {};

    productMovements.forEach((m) => {
      const key = m.productId || "unknown";

      if (!stockByProduct[key]) stockByProduct[key] = 0;

      if (m.movementType === "IN") stockByProduct[key] += m.quantity;
      if (m.movementType === "OUT") stockByProduct[key] -= m.quantity;
    });

    const lowStock = Object.entries(stockByProduct)
      .filter(([_, qty]) => qty < 10)
      .map(([productId, qty]) => ({
        productId,
        qty,
      }));

    // ------------------------
    // CLIENTES MOROSOS
    // ------------------------

    const overdueCustomers = await prisma.financialEntry.findMany({
      where: {
        type: "INCOME",
        status: "PENDING",
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        customer: true,
      },
    });

    // ------------------------
    // RESPONSE
    // ------------------------

    return NextResponse.json({
      status: "ok",
      data: {
        finance: {
          income: income._sum.amount || 0,
          expense: expense._sum.amount || 0,
          receivable: receivable._sum.amount || 0,
          payable: payable._sum.amount || 0,
        },
        sales: {
          total: sales._sum.totalAmount || 0,
          count: sales._count,
        },
        production: {
          count: production._count,
        },
        stock: {
          low: lowStock,
        },
        alerts: {
          overdueCustomers: overdueCustomers.length,
        },
      },
    });
  } catch (error) {
    console.error("dashboard error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Error generando dashboard",
      },
      { status: 500 }
    );
  }
}