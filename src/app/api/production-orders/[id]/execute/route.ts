import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const order = await prisma.productionOrder.findFirst({
      where: {
        id,
      },
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
        product: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          status: "error",
          message: "La orden no existe.",
        },
        { status: 404 }
      );
    }

    if (order.status !== "DRAFT") {
      return NextResponse.json(
        {
          status: "error",
          message: "Solo se pueden ejecutar órdenes en estado DRAFT.",
        },
        { status: 400 }
      );
    }

    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        entityType: "RAW_MATERIAL",
        rawMaterialId: {
          in: order.recipe.items.map((item) => item.rawMaterialId),
        },
      },
    });

    for (const item of order.recipe.items) {
      const availableStock = stockMovements
        .filter((movement) => movement.rawMaterialId === item.rawMaterialId)
        .reduce((acc, movement) => {
          if (movement.movementType === "IN") return acc + movement.quantity;
          if (movement.movementType === "OUT") return acc - movement.quantity;
          return acc + movement.quantity;
        }, 0);

      const requiredQuantity = item.quantity * order.quantityToProduce;

      if (availableStock < requiredQuantity) {
        return NextResponse.json(
          {
            status: "error",
            message: `Stock insuficiente para el insumo ${item.rawMaterial.name}. Disponible: ${availableStock}, requerido: ${requiredQuantity}.`,
          },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.recipe.items) {
        await tx.stockMovement.create({
          data: {
            movementType: "OUT",
            entityType: "RAW_MATERIAL",
            rawMaterialId: item.rawMaterialId,
            productionOrderId: order.id,
            quantity: item.quantity * order.quantityToProduce,
            unitCost: item.rawMaterial.costPerUnit,
            notes: `Consumo por producción ${order.code}`,
          },
        });
      }

      await tx.stockMovement.create({
        data: {
          movementType: "IN",
          entityType: "PRODUCT",
          productId: order.productId,
          productionOrderId: order.id,
          quantity: order.quantityToProduce,
          notes: `Ingreso por producción ${order.code}`,
        },
      });

      await tx.productionOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: "EXECUTED",
          executedAt: new Date(),
        },
      });
    });

    const updatedOrder = await prisma.productionOrder.findFirst({
      where: {
        id: order.id,
      },
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
        product: true,
        stockMovements: {
          include: {
            rawMaterial: true,
            product: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/production-orders/[id]/execute error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo ejecutar la orden de producción.",
      },
      { status: 500 }
    );
  }
}