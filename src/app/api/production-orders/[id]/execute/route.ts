import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.productionOrder.findFirst({
      where: { id: params.id },
      include: {
        recipe: {
          include: {
            items: {
              include: {
                rawMaterial: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "No existe" }, { status: 404 });
    }

    if (order.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Ya ejecutada" },
        { status: 400 }
      );
    }

    let totalCost = 0;

    // CONSUMO INSUMOS
    for (const item of order.recipe.items) {
      const cost = item.quantity * item.rawMaterial.costPerUnit;

      totalCost += cost * order.quantityToProduce;

      await prisma.stockMovement.create({
        data: {
          movementType: "OUT",
          entityType: "RAW_MATERIAL",
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity * order.quantityToProduce,
          unitCost: item.rawMaterial.costPerUnit,
          productionOrderId: order.id,
        },
      });
    }

    // PRODUCCIÓN PRODUCTO
    await prisma.stockMovement.create({
      data: {
        movementType: "IN",
        entityType: "PRODUCT",
        productId: order.productId,
        quantity: order.quantityToProduce,
        unitCost: totalCost / order.quantityToProduce,
        productionOrderId: order.id,
      },
    });

    // ACTUALIZAR ORDEN
    const updated = await prisma.productionOrder.update({
      where: { id: order.id },
      data: {
        status: "EXECUTED",
        executedAt: new Date(),
        totalCost,
        unitCost: totalCost / order.quantityToProduce,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error ejecución" }, { status: 500 });
  }
}