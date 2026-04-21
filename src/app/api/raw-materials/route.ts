import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createRawMaterialSchema = z.object({
  code: z.string().min(1, "code es obligatorio"),
  name: z.string().min(1, "name es obligatorio"),
  description: z.string().optional(),
  unit: z.string().min(1, "unit es obligatorio"),
  costPerUnit: z.number().nonnegative("costPerUnit debe ser >= 0"),
  supplierId: z.string().optional(),
});

export async function GET() {
  try {
    const materials = await prisma.rawMaterial.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        supplier: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: materials,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/raw-materials error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los insumos.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createRawMaterialSchema.safeParse(body);

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

    const existing = await prisma.rawMaterial.findFirst({
      where: {
        code: data.code,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          status: "error",
          message: "Ya existe un insumo con ese código.",
        },
        { status: 409 }
      );
    }

    if (data.supplierId) {
      const supplierExists = await prisma.supplier.findFirst({
        where: {
          id: data.supplierId,
          deletedAt: null,
        },
      });

      if (!supplierExists) {
        return NextResponse.json(
          {
            status: "error",
            message: "El proveedor seleccionado no existe.",
          },
          { status: 400 }
        );
      }
    }

    const material = await prisma.rawMaterial.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        unit: data.unit,
        costPerUnit: data.costPerUnit,
        supplierId: data.supplierId || null,
      },
      include: {
        supplier: true,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: material,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/raw-materials error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear el insumo.",
      },
      { status: 500 }
    );
  }
}