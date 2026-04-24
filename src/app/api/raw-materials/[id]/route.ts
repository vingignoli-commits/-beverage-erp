import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateRawMaterialSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  unit: z.string().min(1).optional(),
  costPerUnit: z.number().nonnegative().optional(),
  supplierId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const material = await prisma.rawMaterial.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      supplier: true,
    },
  });

  if (!material) {
    return NextResponse.json(
      { status: "error", message: "Insumo no encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({ status: "ok", data: material });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateRawMaterialSchema.safeParse(body);

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

    const existing = await prisma.rawMaterial.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { status: "error", message: "Insumo no encontrado." },
        { status: 404 }
      );
    }

    const data = parsed.data;

    if (data.code && data.code !== existing.code) {
      const duplicated = await prisma.rawMaterial.findFirst({
        where: {
          code: data.code,
          id: {
            not: id,
          },
        },
      });

      if (duplicated) {
        return NextResponse.json(
          { status: "error", message: "Ya existe otro insumo con ese código." },
          { status: 409 }
        );
      }
    }

    if (data.supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          id: data.supplierId,
          deletedAt: null,
        },
      });

      if (!supplier) {
        return NextResponse.json(
          { status: "error", message: "El proveedor seleccionado no existe." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.rawMaterial.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        unit: data.unit,
        costPerUnit: data.costPerUnit,
        supplierId: data.supplierId,
        isActive: data.isActive,
      },
      include: {
        supplier: true,
      },
    });

    return NextResponse.json({ status: "ok", data: updated });
  } catch (error) {
    console.error("PATCH /api/raw-materials/[id] error:", error);

    return NextResponse.json(
      { status: "error", message: "No se pudo actualizar el insumo." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const existing = await prisma.rawMaterial.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    return NextResponse.json(
      { status: "error", message: "Insumo no encontrado." },
      { status: 404 }
    );
  }

  await prisma.rawMaterial.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  return NextResponse.json({
    status: "ok",
    message: "Insumo dado de baja.",
  });
}