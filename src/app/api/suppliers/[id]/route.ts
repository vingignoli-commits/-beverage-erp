import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSupplierSchema = z.object({
  supplierCode: z.string().min(1).optional(),
  legalName: z.string().min(1).optional(),
  tradeName: z.string().nullable().optional(),
  taxId: z.string().nullable().optional(),
  taxCondition: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsappPhone: z.string().nullable().optional(),
  addressLine: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  defaultTermsDays: z.number().int().nonnegative().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const supplier = await prisma.supplier.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        {
          status: "error",
          message: "Proveedor no encontrado.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        data: supplier,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/suppliers/[id] error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo obtener el proveedor.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = updateSupplierSchema.safeParse(body);

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

    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        {
          status: "error",
          message: "Proveedor no encontrado.",
        },
        { status: 404 }
      );
    }

    const data = parsed.data;

    if (data.supplierCode && data.supplierCode !== existingSupplier.supplierCode) {
      const duplicatedCode = await prisma.supplier.findFirst({
        where: {
          supplierCode: data.supplierCode,
          id: {
            not: id,
          },
        },
      });

      if (duplicatedCode) {
        return NextResponse.json(
          {
            status: "error",
            message: "Ya existe otro proveedor con ese código.",
          },
          { status: 409 }
        );
      }
    }

    if (data.taxId && data.taxId !== existingSupplier.taxId) {
      const duplicatedTaxId = await prisma.supplier.findFirst({
        where: {
          taxId: data.taxId,
          id: {
            not: id,
          },
        },
      });

      if (duplicatedTaxId) {
        return NextResponse.json(
          {
            status: "error",
            message: "Ya existe otro proveedor con ese CUIT/DNI.",
          },
          { status: 409 }
        );
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        supplierCode: data.supplierCode,
        legalName: data.legalName,
        tradeName: data.tradeName,
        taxId: data.taxId,
        taxCondition: data.taxCondition,
        email: data.email,
        phone: data.phone,
        whatsappPhone: data.whatsappPhone,
        addressLine: data.addressLine,
        city: data.city,
        province: data.province,
        country: data.country,
        postalCode: data.postalCode,
        defaultTermsDays: data.defaultTermsDays,
        notes: data.notes,
        status: data.status,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: updatedSupplier,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/suppliers/[id] error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo actualizar el proveedor.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        {
          status: "error",
          message: "Proveedor no encontrado.",
        },
        { status: 404 }
      );
    }

    await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        message: "Proveedor dado de baja lógicamente.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/suppliers/[id] error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo dar de baja el proveedor.",
      },
      { status: 500 }
    );
  }
}