import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createFinancialEntrySchema = z.object({
  code: z.string().min(1, "code es obligatorio"),
  type: z.enum(["INCOME", "EXPENSE"]),
  concept: z.string().min(1, "concept es obligatorio"),
  amount: z.number().positive("amount debe ser > 0"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
});

export async function GET() {
  try {
    const entries = await prisma.financialEntry.findMany({
      include: {
        customer: true,
        supplier: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: entries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/financial-entries error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los movimientos financieros.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createFinancialEntrySchema.safeParse(body);

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

    const existing = await prisma.financialEntry.findFirst({
      where: {
        code: data.code,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          status: "error",
          message: "Ya existe un movimiento financiero con ese código.",
        },
        { status: 409 }
      );
    }

    if (data.type === "INCOME" && !data.customerId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Los ingresos deben asociarse a un cliente.",
        },
        { status: 400 }
      );
    }

    if (data.type === "EXPENSE" && !data.supplierId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Los egresos deben asociarse a un proveedor.",
        },
        { status: 400 }
      );
    }

    if (data.customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: data.customerId,
          deletedAt: null,
        },
      });

      if (!customer) {
        return NextResponse.json(
          {
            status: "error",
            message: "El cliente seleccionado no existe.",
          },
          { status: 400 }
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
          {
            status: "error",
            message: "El proveedor seleccionado no existe.",
          },
          { status: 400 }
        );
      }
    }

    const entry = await prisma.financialEntry.create({
      data: {
        code: data.code,
        type: data.type,
        concept: data.concept,
        amount: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes,
        customerId: data.customerId || null,
        supplierId: data.supplierId || null,
      },
      include: {
        customer: true,
        supplier: true,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: entry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/financial-entries error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear el movimiento financiero.",
      },
      { status: 500 }
    );
  }
}