import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createProductSchema = z.object({
  productCode: z.string().min(1, "productCode es obligatorio"),
  name: z.string().min(1, "name es obligatorio"),
  description: z.string().optional(),
  type: z.enum(["FINISHED", "INTERMEDIATE"]),
  unit: z.string().min(1, "unit es obligatorio"),
  volumeMl: z.number().int().positive().optional(),
  alcoholPercent: z.number().min(0).max(100).optional(),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los productos.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

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

    const existingProduct = await prisma.product.findFirst({
      where: {
        productCode: data.productCode,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          status: "error",
          message: "Ya existe un producto con ese código.",
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        productCode: data.productCode,
        name: data.name,
        description: data.description,
        type: data.type,
        unit: data.unit,
        volumeMl: data.volumeMl,
        alcoholPercent: data.alcoholPercent,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear el producto.",
      },
      { status: 500 }
    );
  }
}