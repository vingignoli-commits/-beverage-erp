import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createProductionOrderSchema = z.object({
  code: z.string().min(1, "code es obligatorio"),
  recipeId: z.string().min(1, "recipeId es obligatorio"),
  quantityToProduce: z.number().positive("quantityToProduce debe ser mayor a 0"),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const orders = await prisma.productionOrder.findMany({
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
        stockMovements: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/production-orders error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener las órdenes de producción.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProductionOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Datos inválidos.",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existingOrder = await prisma.productionOrder.findFirst({
      where: {
        code: data.code,
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        {
          status: "error",
          message: "Ya existe una orden de producción con ese código.",
        },
        { status: 409 }
      );
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id: data.recipeId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        items: true,
        product: true,
      },
    });

    if (!recipe) {
      return NextResponse.json(
        {
          status: "error",
          message: "La receta seleccionada no existe o no está activa.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.productionOrder.create({
      data: {
        code: data.code,
        recipeId: recipe.id,
        productId: recipe.productId,
        quantityToProduce: data.quantityToProduce,
        notes: data.notes,
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

    return NextResponse.json(
      {
        status: "ok",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/production-orders error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear la orden de producción.",
      },
      { status: 500 }
    );
  }
}