import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createStockMovementSchema = z.object({
  movementType: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  entityType: z.enum(["RAW_MATERIAL", "PRODUCT"]),
  rawMaterialId: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().positive("quantity debe ser mayor a 0"),
  unitCost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        rawMaterial: true,
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: movements,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/stock-movements error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los movimientos de stock.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createStockMovementSchema.safeParse(body);

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

    if (data.entityType === "RAW_MATERIAL") {
      if (!data.rawMaterialId || data.productId) {
        return NextResponse.json(
          {
            status: "error",
            message:
              "Para RAW_MATERIAL debes enviar rawMaterialId y no productId.",
          },
          { status: 400 }
        );
      }

      const rawMaterial = await prisma.rawMaterial.findFirst({
        where: {
          id: data.rawMaterialId,
          deletedAt: null,
        },
      });

      if (!rawMaterial) {
        return NextResponse.json(
          {
            status: "error",
            message: "El insumo seleccionado no existe.",
          },
          { status: 400 }
        );
      }
    }

    if (data.entityType === "PRODUCT") {
      if (!data.productId || data.rawMaterialId) {
        return NextResponse.json(
          {
            status: "error",
            message: "Para PRODUCT debes enviar productId y no rawMaterialId.",
          },
          { status: 400 }
        );
      }

      const product = await prisma.product.findFirst({
        where: {
          id: data.productId,
          deletedAt: null,
        },
      });

      if (!product) {
        return NextResponse.json(
          {
            status: "error",
            message: "El producto seleccionado no existe.",
          },
          { status: 400 }
        );
      }
    }

    const movement = await prisma.stockMovement.create({
      data: {
        movementType: data.movementType,
        entityType: data.entityType,
        rawMaterialId: data.rawMaterialId || null,
        productId: data.productId || null,
        quantity: data.quantity,
        unitCost: data.unitCost,
        notes: data.notes,
      },
      include: {
        rawMaterial: true,
        product: true,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: movement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/stock-movements error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear el movimiento de stock.",
      },
      { status: 500 }
    );
  }
}