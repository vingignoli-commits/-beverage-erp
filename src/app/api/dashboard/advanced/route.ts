import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // ------------------------
    // STOCK VALORIZADO
    // ------------------------

    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        entityType: "RAW_MATERIAL",
      },
    });

    let stockValue = 0;

    stockMovements.forEach((m) => {
      const sign = m.movementType === "IN" ? 1 : -1;
      const cost = m.unitCost || 0;
      stockValue += sign * m.quantity * cost;
    });

    // ------------------------
    // RENTABILIDAD POR PRODUCTO
    // ------------------------

    const orders = await prisma.salesOrder.findMany({
      where: { status: "CONFIRMED" },
      include: {
        items: true,
      },
    });

    const productRevenue: Record<string, number> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productRevenue[item.productId]) {
          productRevenue[item.productId] = 0;
        }
        productRevenue[item.productId] += item.lineTotal;
      });
    });

    const topProducts = Object.entries(productRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // ------------------------
    // FLUJO DE CAJA PROYECTADO (30 días)
    // ------------------------

    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 30);

    const upcoming = await prisma.financialEntry.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          gte: today,
          lte: future,
        },
      },
    });

    let projectedBalance = 0;

    upcoming.forEach((e) => {
      if (e.type === "INCOME") projectedBalance += e.amount;
      if (e.type === "EXPENSE") projectedBalance -= e.amount;
    });

    // ------------------------
    // RESPONSE
    // ------------------------

    return NextResponse.json({
      status: "ok",
      data: {
        stockValue,
        projectedBalance,
        topProducts,
      },
    });
  } catch (error) {
    console.error("advanced dashboard error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Error dashboard avanzado",
      },
      { status: 500 }
    );
  }
}