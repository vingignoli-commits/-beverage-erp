import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
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

    return NextResponse.json({
      status: "ok",
      data: rows,
    });
  } catch (error) {
    console.error("margins error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Error calculando márgenes reales",
      },
      { status: 500 }
    );
  }
}