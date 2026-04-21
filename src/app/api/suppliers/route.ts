import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSupplierSchema = z.object({
  supplierCode: z.string().min(1, "supplierCode es obligatorio"),
  legalName: z.string().min(1, "legalName es obligatorio"),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  taxCondition: z.string().optional(),
  email: z.string().email("email inválido").optional(),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  defaultTermsDays: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
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
        data: suppliers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/suppliers error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los proveedores.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSupplierSchema.safeParse(body);

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

    const existingSupplier = await prisma.supplier.findFirst({
      where: {
        OR: [
          { supplierCode: data.supplierCode },
          ...(data.taxId ? [{ taxId: data.taxId }] : []),
        ],
      },
    });

    if (existingSupplier) {
      return NextResponse.json(
        {
          status: "error",
          message: "Ya existe un proveedor con ese código o CUIT/DNI.",
        },
        { status: 409 }
      );
    }

    const supplier = await prisma.supplier.create({
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
        country: data.country ?? "Argentina",
        postalCode: data.postalCode,
        defaultTermsDays: data.defaultTermsDays ?? 0,
        notes: data.notes,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: supplier,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/suppliers error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear el proveedor.",
      },
      { status: 500 }
    );
  }
}