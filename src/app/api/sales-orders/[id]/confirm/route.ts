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

    const order = await prisma.salesOrder.findFirst({
      where: {
        id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          status: "error",
          message: "El pedido no existe.",
        },
        { status: 404 }
      );
    }

    if (order.status !== "DRAFT") {
      return NextResponse.json(
        {
          status: "error",
          message: "Solo se pueden confirmar pedidos en estado DRAFT.",
        },
        { status: 400 }
      );
    }

    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        entityType: "PRODUCT",
        productId: {
          in: order.items.map((item) => item.productId),
        },
      },
    });

    for (const item of order.items) {
      const availableStock = stockMovements
        .filter((movement) => movement.productId === item.productId)
        .reduce((acc, movement) => {
          if (movement.movementType === "IN") return acc + movement.quantity;
          if (movement.movementType === "OUT") return acc - movement.quantity;
          return acc + movement.quantity;
        }, 0);

      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            status: "error",
            message: `Stock insuficiente para el producto ${item.product.name}. Disponible: ${availableStock}, requerido: ${item.quantity}.`,
          },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.stockMovement.create({
          data: {
            movementType: "OUT",
            entityType: "PRODUCT",
            productId: item.productId,
            salesOrderId: order.id,
            quantity: item.quantity,
            notes: `Salida por pedido de venta ${order.code}`,
          },
        });
      }

      await tx.salesOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });
    });

    const updatedOrder = await prisma.salesOrder.findFirst({
      where: {
        id: order.id,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        stockMovements: true,
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
    console.error("POST /api/sales-orders/[id]/confirm error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo confirmar el pedido.",
      },
      { status: 500 }
    );
  }
}